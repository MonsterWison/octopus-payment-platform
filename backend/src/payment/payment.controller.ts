import { Controller, Get, Post, Body, Param, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentService } from '../services';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() createPaymentDto: any) {
    try {
      const payment = await this.paymentService.createPayment(createPaymentDto);
      return {
        success: true,
        data: payment,
        message: '支付請求已創建',
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
  async getPayment(@Param('id') id: string) {
    try {
      const payment = await this.paymentService.findPaymentById(id);
      if (!payment) {
        throw new Error('支付記錄不存在');
      }
      return {
        success: true,
        data: payment,
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

  @Post(':id/simulate')
  async simulatePayment(@Param('id') id: string) {
    try {
      const payment = await this.paymentService.updatePaymentStatus(id, 'completed');
      if (!payment) {
        throw new Error('支付記錄不存在');
      }
      return {
        success: true,
        data: payment,
        message: '模擬支付完成',
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