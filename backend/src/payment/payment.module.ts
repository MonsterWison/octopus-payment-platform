import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { OrderController } from '../order/order.controller';
import { PaymentService, OrderService } from '../services';
import { OctopusMerchantPlatformModule } from '../octopus-merchant-platform/octopus-merchant-platform.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [OctopusMerchantPlatformModule, WebSocketModule],
  controllers: [PaymentController, OrderController],
  providers: [PaymentService, OrderService],
  exports: [PaymentService, OrderService],
})
export class PaymentModule {}