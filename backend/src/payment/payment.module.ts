import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { OrderController } from '../order/order.controller';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { OctopusMerchantPlatformModule } from '../octopus-merchant-platform/octopus-merchant-platform.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { OctopusPaymentService } from './octopus-payment.service';
import { PaymentService, OrderService } from './simple-services';

// 檢查是否為演示模式
const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.DB_HOST;

@Module({
  imports: [
    // 只在非演示模式下使用TypeORM
    ...(isDemoMode ? [] : [TypeOrmModule.forFeature([Payment, Order])]),
    OctopusMerchantPlatformModule,
    WebSocketModule,
  ],
  controllers: [PaymentController, OrderController],
  providers: [PaymentService, OrderService, OctopusPaymentService],
  exports: [PaymentService, OrderService],
})
export class PaymentModule {}