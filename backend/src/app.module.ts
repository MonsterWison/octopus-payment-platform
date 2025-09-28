import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './payment/payment.module';
import { OrderModule } from './order/order.module';
import { OctopusMerchantPlatformModule } from './octopus-merchant-platform/octopus-merchant-platform.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PaymentModule,
    OrderModule,
    OctopusMerchantPlatformModule,
  ],
})
export class AppModule {}