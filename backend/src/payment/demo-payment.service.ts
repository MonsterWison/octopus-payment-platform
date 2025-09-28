import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from './entities/payment.entity';
import { CreateOrderDto } from '../order/dto/create-order.dto';
import { UpdateOrderDto } from '../order/dto/update-order.dto';
import { OrderStatus } from '../order/entities/order.entity';

// 內存存儲的數據
let orders: any[] = [];
let payments: any[] = [];

@Injectable()
export class DemoPaymentService {
  // 支付相關方法
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    const payment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...createPaymentDto,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      qrCodeData: this.generateQRCodeData(createPaymentDto),
      paymentToken: this.generatePaymentToken(),
    };
    
    payments.push(payment);
    return payment;
  }

  async findPaymentById(id: string): Promise<any> {
    return payments.find(p => p.id === id);
  }

  async updatePaymentStatus(id: string, updatePaymentDto: UpdatePaymentDto): Promise<any> {
    const paymentIndex = payments.findIndex(p => p.id === id);
    if (paymentIndex === -1) {
      throw new Error('支付記錄不存在');
    }
    
    payments[paymentIndex] = {
      ...payments[paymentIndex],
      ...updatePaymentDto,
      updatedAt: new Date(),
    };
    
    return payments[paymentIndex];
  }

  // 訂單相關方法
  async createOrder(createOrderDto: CreateOrderDto): Promise<any> {
    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...createOrderDto,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    orders.push(order);
    return order;
  }

  async findOrderById(id: string): Promise<any> {
    return orders.find(o => o.id === id);
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<any> {
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new Error('訂單不存在');
    }
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateOrderDto,
      updatedAt: new Date(),
    };
    
    return orders[orderIndex];
  }

  // 輔助方法
  private generateQRCodeData(payment: any): string {
    const qrData = {
      url: `https://www.online-octopus.com/oos/payment/?token=${payment.paymentToken || 'demo_token'}`,
      token: payment.paymentToken || 'demo_token',
      merchantId: process.env.OCTOPUS_MERCHANT_ID || 'demo_merchant',
      orderId: payment.orderId,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(qrData);
  }

  private generatePaymentToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
