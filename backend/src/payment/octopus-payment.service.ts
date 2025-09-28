import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OctopusPaymentService {
  private readonly baseUrl: string;
  private readonly merchantId: string;
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get('OCTOPUS_API_URL', 'https://api.octopus.com.hk');
    this.merchantId = this.configService.get('OCTOPUS_MERCHANT_ID');
    this.secretKey = this.configService.get('OCTOPUS_SECRET_KEY');
  }

  async createPaymentRequest(paymentData: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
  }): Promise<any> {
    try {
      const payload = {
        merchantId: this.merchantId,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        timestamp: new Date().toISOString(),
        signature: this.generateSignature(paymentData),
      };

      const response = await axios.post(`${this.baseUrl}/v1/payments`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('八達通支付請求失敗:', error.response?.data || error.message);
      throw new Error('無法創建八達通支付請求');
    }
  }

  async verifyPayment(transactionId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/payments/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('八達通支付驗證失敗:', error.response?.data || error.message);
      throw new Error('無法驗證八達通支付狀態');
    }
  }

  async processRefund(transactionId: string, amount: number, reason: string): Promise<any> {
    try {
      const payload = {
        transactionId,
        amount,
        reason,
        timestamp: new Date().toISOString(),
        signature: this.generateRefundSignature(transactionId, amount),
      };

      const response = await axios.post(`${this.baseUrl}/v1/refunds`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('八達通退款失敗:', error.response?.data || error.message);
      throw new Error('無法處理八達通退款');
    }
  }

  private generateSignature(data: any): string {
    const crypto = require('crypto');
    const message = `${data.orderId}${data.amount}${data.currency}${data.timestamp}`;
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('hex');
  }

  private generateRefundSignature(transactionId: string, amount: number): string {
    const crypto = require('crypto');
    const message = `${transactionId}${amount}${new Date().toISOString()}`;
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('hex');
  }

  // 模擬八達通API響應（用於開發和測試）
  async simulatePaymentResponse(paymentId: string): Promise<any> {
    // 模擬支付成功響應
    return {
      transactionId: `oct_${Date.now()}`,
      status: 'SUCCESS',
      amount: 100.00,
      currency: 'HKD',
      timestamp: new Date().toISOString(),
      message: '支付成功',
    };
  }
}
