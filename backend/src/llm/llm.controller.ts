import { Controller, Post, Body, Get, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import { ChatService } from './chat.service';
import { AnalysisService } from './analysis.service';
import { PredictionService } from './prediction.service';

@Controller('llm')
export class LlmController {
  private readonly logger = new Logger(LlmController.name);

  constructor(
    private readonly llmService: LlmService,
    private readonly chatService: ChatService,
    private readonly analysisService: AnalysisService,
    private readonly predictionService: PredictionService,
  ) {}

  @Post('chat/message')
  async sendMessage(@Body() messageData: {
    message: string;
    sessionId: string;
    context?: any;
  }) {
    try {
      const response = await this.llmService.generateResponse(
        messageData.message,
        messageData.context
      );

      await this.chatService.saveMessage({
        sessionId: messageData.sessionId,
        userMessage: messageData.message,
        botResponse: response,
        timestamp: new Date(),
      });

      return {
        success: true,
        data: {
          response,
          sessionId: messageData.sessionId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`聊天消息處理失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: '無法處理您的消息，請稍後再試',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('chat/history/:sessionId')
  async getChatHistory(@Query('sessionId') sessionId: string) {
    try {
      const history = await this.chatService.getChatHistory(sessionId);
      return {
        success: true,
        data: history,
      };
    } catch (error) {
      this.logger.error(`獲取聊天記錄失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: '無法獲取聊天記錄',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('chat/feedback')
  async submitFeedback(@Body() feedbackData: {
    sessionId: string;
    messageId: string;
    rating: number;
    comment?: string;
  }) {
    try {
      await this.chatService.saveFeedback(feedbackData);
      return {
        success: true,
        message: '感謝您的反饋',
      };
    } catch (error) {
      this.logger.error(`提交反饋失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: '無法提交反饋',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analysis/daily-report')
  async getDailyReport(@Query('date') date: string) {
    try {
      const report = await this.analysisService.generateDailyReport(date);
      return {
        success: true,
        data: report,
      };
    } catch (error) {
      this.logger.error(`生成日報失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: '無法生成日報',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analysis/weekly-report')
  async getWeeklyReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      const report = await this.analysisService.generateWeeklyReport(startDate, endDate);
      return {
        success: true,
        data: report,
      };
    } catch (error) {
      this.logger.error(`生成週報失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: '無法生成週報',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analysis/monthly-report')
  async getMonthlyReport(
    @Query('month') month: string,
    @Query('year') year: number,
  ) {
    try {
      const report = await this.analysisService.generateMonthlyReport(month, year);
      return {
        success: true,
        data: report,
      };
    } catch (error) {
      this.logger.error(`生成月報失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: '無法生成月報',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('prediction/customer-behavior/:customerId')
  async predictCustomerBehavior(@Query('customerId') customerId: string) {
    try {
      const prediction = await this.predictionService.predictCustomerBehavior(customerId);
      return {
        success: true,
        data: prediction,
      };
    } catch (error) {
      this.logger.error(`客戶行為預測失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: '無法預測客戶行為',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('prediction/payment-success')
  async predictPaymentSuccess(@Body() paymentData: any) {
    try {
      const prediction = await this.predictionService.predictPaymentSuccess(paymentData);
      return {
        success: true,
        data: prediction,
      };
    } catch (error) {
      this.logger.error(`支付成功率預測失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: '無法預測支付成功率',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('prediction/churn-risk/:customerId')
  async predictChurnRisk(@Query('customerId') customerId: string) {
    try {
      const prediction = await this.predictionService.predictChurnRisk(customerId);
      return {
        success: true,
        data: prediction,
      };
    } catch (error) {
      this.logger.error(`流失風險預測失敗: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: '無法預測流失風險',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
