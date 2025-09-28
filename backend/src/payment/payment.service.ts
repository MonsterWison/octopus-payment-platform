import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { OctopusPaymentService } from './octopus-payment.service';
import { OctopusMerchantPlatformService } from '../octopus-merchant-platform/octopus-merchant-platform.service';
import { PaymentWebSocketGateway } from '../websocket/websocket.gateway';
import { DemoPaymentService } from './demo-payment.service';

// 檢查是否為演示模式
const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.DB_HOST;

@Injectable()
export class PaymentService {
  constructor(
    @Optional() @InjectRepository(Payment)
    private paymentRepository?: Repository<Payment>,
    @Optional() @InjectRepository(Order)
    private orderRepository?: Repository<Order>,
    private octopusPaymentService?: OctopusPaymentService,
    private merchantPlatformService?: OctopusMerchantPlatformService,
    private webSocketGateway?: PaymentWebSocketGateway,
    private demoService?: DemoPaymentService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { orderId, amount, currency = 'HKD', method = PaymentMethod.OCTOPUS_QR } = createPaymentDto;

    // 驗證訂單存在
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('訂單不存在');
    }

    // 創建支付記錄
    const payment = this.paymentRepository.create({
      orderId,
      amount,
      currency,
      method,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // 生成QR Code數據和付款編號
    const qrCodeData = await this.generateQRCodeData(savedPayment);
    const paymentToken = this.generatePaymentToken();
    
    savedPayment.qrCodeData = qrCodeData;
    savedPayment.paymentToken = paymentToken;

    await this.paymentRepository.save(savedPayment);

    return savedPayment;
  }

  async findPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new Error('支付記錄不存在');
    }

    return payment;
  }

  async updatePaymentStatus(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findPaymentById(id);
    
    payment.status = updatePaymentDto.status;
    payment.octopusTransactionId = updatePaymentDto.octopusTransactionId;
    payment.octopusResponse = updatePaymentDto.octopusResponse;
    payment.failureReason = updatePaymentDto.failureReason;

    if (updatePaymentDto.status === PaymentStatus.COMPLETED) {
      payment.completedAt = new Date();
      
      // 更新訂單狀態
      await this.orderRepository.update(payment.orderId, {
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      });

      // 同步交易數據到八達通商戶平台
      try {
        await this.merchantPlatformService.syncTransactionToPlatform({
          transactionId: payment.octopusTransactionId || payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          timestamp: payment.completedAt.toISOString(),
          customerInfo: {
            email: payment.order?.customerEmail,
            phone: payment.order?.customerPhone,
          },
        });
      } catch (error) {
        console.error('同步交易數據到商戶平台失敗:', error);
      }
    }

    const updatedPayment = await this.paymentRepository.save(payment);

    // 通過WebSocket通知前端
    this.webSocketGateway.notifyPaymentUpdate(updatedPayment);

    return updatedPayment;
  }

  async processOctopusWebhook(webhookData: any): Promise<void> {
    const { transactionId, status, amount, orderId } = webhookData;

    const payment = await this.paymentRepository.findOne({
      where: { octopusTransactionId: transactionId },
    });

    if (!payment) {
      throw new Error('找不到對應的支付記錄');
    }

    // 驗證金額
    if (payment.amount !== amount) {
      throw new Error('支付金額不匹配');
    }

    // 更新支付狀態
    const updateDto: UpdatePaymentDto = {
      status: this.mapOctopusStatus(status),
      octopusTransactionId: transactionId,
      octopusResponse: JSON.stringify(webhookData),
    };

    await this.updatePaymentStatus(payment.id, updateDto);
  }

  private async generateQRCodeData(payment: Payment): Promise<string> {
    // 生成符合八達通O! ePay規範的QR Code數據
    const qrData = {
      // 八達通官方格式
      url: `https://www.online-octopus.com/oos/payment/?token=${payment.paymentToken}`,
      token: payment.paymentToken,
      merchantId: process.env.OCTOPUS_MERCHANT_ID,
      orderId: payment.orderId,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      timestamp: new Date().toISOString(),
      signature: await this.generateSignature(payment),
    };

    return JSON.stringify(qrData);
  }

  private generatePaymentToken(): string {
    // 生成類似 wG6YPjY 格式的付款編號
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async generateSignature(payment: Payment): Promise<string> {
    // 生成簽名用於驗證QR Code的完整性
    const crypto = require('crypto');
    const secret = process.env.OCTOPUS_SECRET_KEY;
    const data = `${payment.id}${payment.amount}${payment.currency}`;
    
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  private mapOctopusStatus(octopusStatus: string): PaymentStatus {
    const statusMap = {
      'SUCCESS': PaymentStatus.COMPLETED,
      'FAILED': PaymentStatus.FAILED,
      'PENDING': PaymentStatus.PROCESSING,
      'CANCELLED': PaymentStatus.CANCELLED,
    };

    return statusMap[octopusStatus] || PaymentStatus.FAILED;
  }
}
