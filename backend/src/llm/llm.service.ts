import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly openai: OpenAI;
  private readonly anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
    
    this.anthropic = new Anthropic({
      apiKey: this.configService.get('ANTHROPIC_API_KEY'),
    });
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一個專業的八達通支付客服助手，能夠幫助客戶解決支付相關問題。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error(`LLM響應生成失敗: ${error.message}`);
      throw new Error('無法生成AI響應');
    }
  }

  async analyzeTransactionData(transactions: any[]): Promise<any> {
    try {
      const prompt = `分析以下交易數據，提供洞察和建議：
      ${JSON.stringify(transactions, null, 2)}`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return {
        insights: response.content[0].text,
        recommendations: this.extractRecommendations(response.content[0].text),
        trends: this.extractTrends(response.content[0].text)
      };
    } catch (error) {
      this.logger.error(`交易數據分析失敗: ${error.message}`);
      throw new Error('無法分析交易數據');
    }
  }

  async predictCustomerBehavior(customerData: any): Promise<any> {
    try {
      const prompt = `基於以下客戶數據預測其支付行為：
      ${JSON.stringify(customerData, null, 2)}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一個專業的客戶行為分析師，能夠預測客戶的支付行為和偏好。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      return {
        predictions: response.choices[0].message.content,
        confidence: this.calculateConfidence(response.choices[0].message.content),
        recommendations: this.generateRecommendations(response.choices[0].message.content)
      };
    } catch (error) {
      this.logger.error(`客戶行為預測失敗: ${error.message}`);
      throw new Error('無法預測客戶行為');
    }
  }

  private extractRecommendations(analysis: string): string[] {
    const recommendations = [];
    const lines = analysis.split('\n');
    
    for (const line of lines) {
      if (line.includes('建議') || line.includes('推薦') || line.includes('應該')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations;
  }

  private extractTrends(analysis: string): string[] {
    const trends = [];
    const lines = analysis.split('\n');
    
    for (const line of lines) {
      if (line.includes('趨勢') || line.includes('增長') || line.includes('下降') || line.includes('變化')) {
        trends.push(line.trim());
      }
    }
    
    return trends;
  }

  private calculateConfidence(prediction: string): number {
    const confidenceKeywords = ['高', '中', '低', '很可能', '可能', '不太可能'];
    let confidence = 0.5;
    
    for (const keyword of confidenceKeywords) {
      if (prediction.includes(keyword)) {
        if (keyword.includes('高') || keyword.includes('很可能')) {
          confidence = 0.8;
        } else if (keyword.includes('中') || keyword.includes('可能')) {
          confidence = 0.6;
        } else if (keyword.includes('低') || keyword.includes('不太可能')) {
          confidence = 0.3;
        }
        break;
      }
    }
    
    return confidence;
  }

  private generateRecommendations(prediction: string): string[] {
    const recommendations = [];
    
    if (prediction.includes('高價值客戶')) {
      recommendations.push('提供VIP服務和優惠');
      recommendations.push('增加個性化推薦');
    }
    
    if (prediction.includes('流失風險')) {
      recommendations.push('發送優惠券和促銷信息');
      recommendations.push('提供客戶支持');
    }
    
    if (prediction.includes('新客戶')) {
      recommendations.push('提供新手指導');
      recommendations.push('發送歡迎優惠');
    }
    
    return recommendations;
  }
}
