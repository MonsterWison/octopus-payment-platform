import { Controller, Get, Post, Body, Param, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { OrderService } from '../payment/simple-services';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    try {
      const order = await this.orderService.createOrder(createOrderDto);
      return {
        success: true,
        data: order,
        message: '訂單已創建',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    try {
      const order = await this.orderService.findOrderById(id);
      return {
        success: true,
        data: order,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  async updateOrder(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    try {
      const order = await this.orderService.updateOrder(id, updateOrderDto);
      return {
        success: true,
        data: order,
        message: '訂單已更新',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}