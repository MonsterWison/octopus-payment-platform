import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(private readonly llmService: LlmService) {}

  async predictCustomerBehavior(customerId: string): Promise<any> {
    try {
      // 模擬客戶數據
      const customerData = {
        id: customerId,
        totalTransactions: 10,
        averageAmount: 150,
        lastTransactionDate: '2024-01-15',
        paymentSuccessRate: 0.9,
      };

      const prediction = await this.llmService.predictCustomerBehavior(customerData);

      return {
        customerId,
        prediction: prediction.predictions,
        confidence: prediction.confidence,
        recommendations: prediction.recommendations,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`客戶行為預測失敗: ${error.message}`);
      throw new Error('無法預測客戶行為');
    }
  }

  async predictPaymentSuccess(paymentData: any): Promise<any> {
    try {
      const prediction = await this.llmService.predictCustomerBehavior(paymentData);

      return {
        paymentId: paymentData.paymentId,
        successProbability: prediction.confidence,
        riskFactors: this.identifyRiskFactors(paymentData),
        recommendations: prediction.recommendations,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`支付成功率預測失敗: ${error.message}`);
      throw new Error('無法預測支付成功率');
    }
  }

  async predictChurnRisk(customerId: string): Promise<any> {
    try {
      // 模擬客戶數據
      const customerData = {
        id: customerId,
        lastPaymentDate: '2024-01-01',
        failedPayments: 2,
        totalAmount: 500,
      };

      const prediction = await this.llmService.predictCustomerBehavior(customerData);

      return {
        customerId,
        churnRisk: this.calculateChurnRisk(prediction.confidence),
        riskFactors: this.identifyChurnRiskFactors(customerData),
        recommendations: this.generateRetentionRecommendations(prediction.recommendations),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`流失風險預測失敗: ${error.message}`);
      throw new Error('無法預測流失風險');
    }
  }

  private identifyRiskFactors(paymentData: any): string[] {
    const riskFactors = [];
    
    if (paymentData.amount > 10000) {
      riskFactors.push('高額交易');
    }
    
    if (paymentData.customerEmail && !paymentData.customerEmail.includes('@')) {
      riskFactors.push('無效郵箱');
    }
    
    if (paymentData.customerPhone && paymentData.customerPhone.length < 8) {
      riskFactors.push('無效電話號碼');
    }
    
    return riskFactors;
  }

  private calculateChurnRisk(confidence: number): string {
    if (confidence > 0.7) {
      return '高風險';
    } else if (confidence > 0.4) {
      return '中風險';
    } else {
      return '低風險';
    }
  }

  private identifyChurnRiskFactors(customerData: any): string[] {
    const riskFactors = [];
    
    if (customerData.lastPaymentDate) {
      const daysSinceLastPayment = Math.floor(
        (Date.now() - new Date(customerData.lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastPayment > 30) {
        riskFactors.push('長期未使用');
      }
    }
    
    if (customerData.failedPayments > 3) {
      riskFactors.push('多次支付失敗');
    }
    
    if (customerData.totalAmount < 100) {
      riskFactors.push('低價值客戶');
    }
    
    return riskFactors;
  }

  private generateRetentionRecommendations(recommendations: string[]): string[] {
    const retentionRecommendations = [
      '發送個性化優惠券',
      '提供客戶支持',
      '發送使用提醒',
      '提供新功能介紹',
    ];
    
    return [...recommendations, ...retentionRecommendations];
  }
}
