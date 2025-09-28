import { Module } from '@nestjs/common';
import { PaymentWebSocketGateway } from './websocket.gateway';

@Module({
  providers: [PaymentWebSocketGateway],
  exports: [PaymentWebSocketGateway],
})
export class WebSocketModule {}