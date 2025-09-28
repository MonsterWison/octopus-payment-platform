import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Order {
  id: string;
  orderNumber: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  qrCodeData?: string;
  paymentToken?: string;
  octopusTransactionId?: string;
  createdAt: Date;
}

@Injectable()
export class OrderService {
  private orders: Order[] = [];

  async createOrder(orderData: any): Promise<Order> {
    const order: Order = {
      id: uuidv4(),
      orderNumber: this.generateOrderNumber(),
      description: orderData.description,
      amount: orderData.amount,
      currency: orderData.currency || 'HKD',
      status: 'pending',
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      createdAt: new Date(),
    };

    this.orders.push(order);
    return order;
  }

  async findOrderById(id: string): Promise<Order | undefined> {
    return this.orders.find(order => order.id === id);
  }

  async updateOrder(id: string, updateData: any): Promise<Order | undefined> {
    const order = this.orders.find(o => o.id === id);
    if (order) {
      Object.assign(order, updateData);
    }
    return order;
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }
}

@Injectable()
export class PaymentService {
  private payments: Payment[] = [];

  async createPayment(paymentData: any): Promise<Payment> {
    const payment: Payment = {
      id: uuidv4(),
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'HKD',
      status: 'pending',
      method: paymentData.method || 'octopus_qr',
      paymentToken: this.generatePaymentToken(),
      createdAt: new Date(),
    };

    // 生成QR Code數據
    payment.qrCodeData = JSON.stringify({
      url: `https://www.online-octopus.com/oos/payment/?token=${payment.paymentToken}`,
      token: payment.paymentToken,
      merchantId: 'demo_merchant_123',
      orderId: payment.orderId,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      timestamp: new Date().toISOString(),
    });

    this.payments.push(payment);
    return payment;
  }

  async findPaymentById(id: string): Promise<Payment | undefined> {
    return this.payments.find(payment => payment.id === id);
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment | undefined> {
    const payment = this.payments.find(p => p.id === id);
    if (payment) {
      payment.status = status;
      if (status === 'completed') {
        payment.octopusTransactionId = `oct_${Date.now()}`;
      }
    }
    return payment;
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
