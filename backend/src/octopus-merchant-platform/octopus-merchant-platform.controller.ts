import { Controller, Get, Post, Put, Body, Param, Query, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { OctopusMerchantPlatformService } from './octopus-merchant-platform.service';

@Controller('merchant-platform')
export class OctopusMerchantPlatformController {
  constructor(
    private readonly merchantPlatformService: OctopusMerchantPlatformService,
  ) {}

  /**
   * 驗證商戶平台連接
   */
  @Get('verify-connection')
  async verifyConnection() {
    try {
      const isConnected = await this.merchantPlatformService.verifyPlatformConnection();
      return {
        success: true,
        connected: isConnected,
        message: isConnected ? '商戶平台連接正常' : '商戶平台連接失敗',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '連接驗證失敗',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 獲取商戶信息
   */
  @Get('merchant-info')
  async getMerchantInfo() {
    try {
      const merchantInfo = await this.merchantPlatformService.getMerchantInfo();
      return {
        success: true,
        data: merchantInfo,
        message: '商戶信息獲取成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '獲取商戶信息失敗',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 同步交易數據
   */
  @Post('sync-transaction')
  async syncTransaction(@Body() transactionData: any) {
    try {
      const success = await this.merchantPlatformService.syncTransactionToPlatform(transactionData);
      return {
        success,
        message: success ? '交易數據同步成功' : '交易數據同步失敗',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '交易數據同步失敗',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 獲取財務報表
   */
  @Get('financial-report')
  async getFinancialReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      if (!startDate || !endDate) {
        throw new HttpException(
          {
            success: false,
            message: '請提供開始日期和結束日期',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const report = await this.merchantPlatformService.getFinancialReport({
        startDate,
        endDate,
      });

      return {
        success: true,
        data: report,
        message: '財務報表獲取成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '獲取財務報表失敗',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 處理商戶平台Webhook
   */
  @Post('webhook')
  async handleWebhook(
    @Body() webhookData: any,
    @Headers('x-octopus-signature') signature: string,
  ) {
    try {
      const success = await this.merchantPlatformService.handlePlatformWebhook(
        webhookData,
        signature,
      );

      return {
        success,
        message: success ? 'Webhook處理成功' : 'Webhook處理失敗',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Webhook處理失敗',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 更新商戶設置
   */
  @Put('settings')
  async updateSettings(@Body() settings: any) {
    try {
      const success = await this.merchantPlatformService.updateMerchantSettings(settings);
      return {
        success,
        message: success ? '商戶設置更新成功' : '商戶設置更新失敗',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '商戶設置更新失敗',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 獲取API使用統計
   */
  @Get('api-usage')
  async getApiUsage() {
    try {
      const stats = await this.merchantPlatformService.getApiUsageStats();
      return {
        success: true,
        data: stats,
        message: 'API使用統計獲取成功',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '獲取API使用統計失敗',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 健康檢查
   */
  @Get('health')
  async healthCheck() {
    try {
      const isConnected = await this.merchantPlatformService.verifyPlatformConnection();
      return {
        success: true,
        status: isConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        platform: 'octopus-merchant-platform',
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        platform: 'octopus-merchant-platform',
        error: error.message,
      };
    }
  }
}
