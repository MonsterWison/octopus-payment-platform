import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PaymentController } from './payment/payment.controller';
import { OrderController } from './order/order.controller';
import { AuthController } from './auth/auth.controller';
import { PaymentService, OrderService } from './payment/simple-services';
import { AuthService } from './auth/simple-auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'demo-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentController, OrderController, AuthController],
  providers: [PaymentService, OrderService, AuthService],
  exports: [PaymentService, OrderService, AuthService],
})
export class SimpleAppModule {}
