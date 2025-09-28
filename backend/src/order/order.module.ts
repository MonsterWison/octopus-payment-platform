import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from '../services';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}