import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from './payment/payment.module';
import { OrderModule } from './order/order.module';
import { OctopusMerchantPlatformModule } from './octopus-merchant-platform/octopus-merchant-platform.module';
import { AuthModule } from './auth/auth.module';
import { LlmModule } from './llm/llm.module';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'octopus_payment',
      entities: [User],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    LlmModule,
    PaymentModule,
    OrderModule,
    OctopusMerchantPlatformModule,
  ],
})
export class AppModule {}