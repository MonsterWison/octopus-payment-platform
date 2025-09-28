import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from './payment/payment.module';
import { OrderModule } from './order/order.module';
import { OctopusMerchantPlatformModule } from './octopus-merchant-platform/octopus-merchant-platform.module';
import { AuthModule } from './auth/auth.module';
import { LlmModule } from './llm/llm.module';
import { User } from './auth/entities/user.entity';
import { Payment } from './payment/entities/payment.entity';
import { Order } from './order/entities/order.entity';

// 檢查是否為演示模式（沒有數據庫）
const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.DB_HOST;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // 只在非演示模式下使用數據庫
    ...(isDemoMode ? [] : [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'octopus_payment',
        entities: [User, Payment, Order],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        retryAttempts: 3,
        retryDelay: 3000,
        autoLoadEntities: true,
      }),
    ]),
    AuthModule,
    LlmModule,
    PaymentModule,
    OrderModule,
    OctopusMerchantPlatformModule,
  ],
})
export class AppModule {}