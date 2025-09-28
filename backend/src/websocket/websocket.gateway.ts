import { WebSocketGateway as WSGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Payment } from '../payment/entities/payment.entity';

@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class PaymentWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log(`客戶端已連接: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`客戶端已斷開: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  notifyPaymentUpdate(payment: Payment) {
    // 通知所有連接的客戶端支付狀態更新
    this.server.emit('paymentUpdate', {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      completedAt: payment.completedAt,
    });
  }

  notifyOrderUpdate(orderId: string, status: string) {
    // 通知訂單狀態更新
    this.server.emit('orderUpdate', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  joinPaymentRoom(client: Socket, paymentId: string) {
    client.join(`payment_${paymentId}`);
  }

  leavePaymentRoom(client: Socket, paymentId: string) {
    client.leave(`payment_${paymentId}`);
  }
}
