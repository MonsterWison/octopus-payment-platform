import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class OctopusMerchantPlatformService {
  private readonly logger = new Logger(OctopusMerchantPlatformService.name);
  private readonly platformUrl: string;
  private readonly apiUrl: string;
  private readonly merchantId: string;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly environment: string;

  constructor(private configService: ConfigService) {
    this.platformUrl = this.configService.get('OCTOPUS_MERCHANT_PLATFORM_URL');
    this.apiUrl = this.configService.get('OCTOPUS_API_URL');
    this.merchantId = this.configService.get('OCTOPUS_MERCHANT_ID');
    this.apiKey = this.configService.get('OCTOPUS_API_KEY');
    this.secretKey = this.configService.get('OCTOPUS_SECRET_KEY');
    this.webhookSecret = this.configService.get('OCTOPUS_WEBHOOK_SECRET');
    this.environment = this.configService.get('NODE_ENV');
  }

  /**
   * 驗證商戶平台連接
   */
  async verifyPlatformConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.platformUrl}/api/v1/merchant/status`, {
        headers: this.getAuthHeaders(),
        timeout: 10000,
      });

      this.logger.log(`商戶平台連接驗證成功: ${response.data.status}`);
      return response.data.status === 'active';
    } catch (error) {
      this.logger.error(`商戶平台連接驗證失敗: ${error.message}`);
      return false;
    }
  }

  /**
   * 獲取商戶信息
   */
  async getMerchantInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.platformUrl}/api/v1/merchant/info`, {
        headers: this.getAuthHeaders(),
        timeout: 10000,
      });

      this.logger.log('商戶信息獲取成功');
      return response.data;
    } catch (error) {
      this.logger.error(`獲取商戶信息失敗: ${error.message}`);
      throw new Error('無法獲取商戶信息');
    }
  }

  /**
   * 同步交易數據到商戶平台
   */
  async syncTransactionToPlatform(transactionData: {
    transactionId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    timestamp: string;
    customerInfo?: any;
  }): Promise<boolean> {
    try {
      const payload = {
        merchantId: this.merchantId,
        transactionId: transactionData.transactionId,
        orderId: transactionData.orderId,
        amount: transactionData.amount,
        currency: transactionData.currency,
        status: transactionData.status,
        timestamp: transactionData.timestamp,
        customerInfo: transactionData.customerInfo,
        signature: this.generateTransactionSignature(transactionData),
      };

      const response = await axios.post(
        `${this.platformUrl}/api/v1/transactions/sync`,
        payload,
        {
          headers: this.getAuthHeaders(),
          timeout: 15000,
        }
      );

      this.logger.log(`交易數據同步成功: ${transactionData.transactionId}`);
      return response.data.success;
    } catch (error) {
      this.logger.error(`交易數據同步失敗: ${error.message}`);
      return false;
    }
  }

  /**
   * 獲取財務報表
   */
  async getFinancialReport(dateRange: {
    startDate: string;
    endDate: string;
  }): Promise<any> {
    try {
      const response = await axios.get(
        `${this.platformUrl}/api/v1/reports/financial`,
        {
          headers: this.getAuthHeaders(),
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            merchantId: this.merchantId,
          },
          timeout: 15000,
        }
      );

      this.logger.log('財務報表獲取成功');
      return response.data;
    } catch (error) {
      this.logger.error(`獲取財務報表失敗: ${error.message}`);
      throw new Error('無法獲取財務報表');
    }
  }

  /**
   * 處理商戶平台Webhook
   */
  async handlePlatformWebhook(webhookData: any, signature: string): Promise<boolean> {
    try {
      // 驗證Webhook簽名
      if (!this.verifyWebhookSignature(JSON.stringify(webhookData), signature)) {
        this.logger.error('Webhook簽名驗證失敗');
        return false;
      }

      // 處理不同類型的Webhook事件
      switch (webhookData.eventType) {
        case 'merchant.status.changed':
          await this.handleMerchantStatusChange(webhookData);
          break;
        case 'api.key.rotated':
          await this.handleApiKeyRotation(webhookData);
          break;
        case 'transaction.updated':
          await this.handleTransactionUpdate(webhookData);
          break;
        case 'settlement.processed':
          await this.handleSettlementProcessed(webhookData);
          break;
        default:
          this.logger.warn(`未知的Webhook事件類型: ${webhookData.eventType}`);
      }

      this.logger.log(`Webhook處理成功: ${webhookData.eventType}`);
      return true;
    } catch (error) {
      this.logger.error(`Webhook處理失敗: ${error.message}`);
      return false;
    }
  }

  /**
   * 更新商戶設置
   */
  async updateMerchantSettings(settings: {
    webhookUrl?: string;
    notificationEmail?: string;
    autoSettlement?: boolean;
    settlementThreshold?: number;
  }): Promise<boolean> {
    try {
      const payload = {
        merchantId: this.merchantId,
        settings,
        signature: this.generateSettingsSignature(settings),
      };

      const response = await axios.put(
        `${this.platformUrl}/api/v1/merchant/settings`,
        payload,
        {
          headers: this.getAuthHeaders(),
          timeout: 10000,
        }
      );

      this.logger.log('商戶設置更新成功');
      return response.data.success;
    } catch (error) {
      this.logger.error(`商戶設置更新失敗: ${error.message}`);
      return false;
    }
  }

  /**
   * 獲取API使用統計
   */
  async getApiUsageStats(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.platformUrl}/api/v1/merchant/api-usage`,
        {
          headers: this.getAuthHeaders(),
          params: {
            merchantId: this.merchantId,
            period: '30d', // 30天
          },
          timeout: 10000,
        }
      );

      this.logger.log('API使用統計獲取成功');
      return response.data;
    } catch (error) {
      this.logger.error(`獲取API使用統計失敗: ${error.message}`);
      throw new Error('無法獲取API使用統計');
    }
  }

  /**
   * 生成認證頭
   */
  private getAuthHeaders(): Record<string, string> {
    const timestamp = new Date().toISOString();
    const nonce = this.generateNonce();
    const signature = this.generateAuthSignature(timestamp, nonce);

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Octopus-Merchant-ID': this.merchantId,
      'X-Octopus-Timestamp': timestamp,
      'X-Octopus-Nonce': nonce,
      'X-Octopus-Signature': signature,
      'X-Octopus-Environment': this.environment,
    };
  }

  /**
   * 生成認證簽名
   */
  private generateAuthSignature(timestamp: string, nonce: string): string {
    const message = `${this.merchantId}${timestamp}${nonce}`;
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('hex');
  }

  /**
   * 生成交易簽名
   */
  private generateTransactionSignature(transactionData: any): string {
    const message = `${transactionData.transactionId}${transactionData.orderId}${transactionData.amount}${transactionData.timestamp}`;
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('hex');
  }

  /**
   * 生成設置簽名
   */
  private generateSettingsSignature(settings: any): string {
    const message = JSON.stringify(settings) + new Date().toISOString();
    return crypto.createHmac('sha256', this.secretKey).update(message).digest('hex');
  }

  /**
   * 驗證Webhook簽名
   */
  private verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * 生成隨機數
   */
  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 處理商戶狀態變更
   */
  private async handleMerchantStatusChange(data: any): Promise<void> {
    this.logger.log(`商戶狀態變更: ${data.status}`);
    // 實現商戶狀態變更邏輯
  }

  /**
   * 處理API密鑰輪換
   */
  private async handleApiKeyRotation(data: any): Promise<void> {
    this.logger.log('API密鑰已輪換，需要更新配置');
    // 實現API密鑰更新邏輯
  }

  /**
   * 處理交易更新
   */
  private async handleTransactionUpdate(data: any): Promise<void> {
    this.logger.log(`交易更新: ${data.transactionId}`);
    // 實現交易更新邏輯
  }

  /**
   * 處理結算完成
   */
  private async handleSettlementProcessed(data: any): Promise<void> {
    this.logger.log(`結算完成: ${data.settlementId}`);
    // 實現結算處理邏輯
  }
}
