import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(private readonly llmService: LlmService) {}

  async generateDailyReport(date: string): Promise<any> {
    try {
      // 模擬交易數據
      const transactions = [
        { id: '1', amount: 100, status: 'completed', timestamp: date },
        { id: '2', amount: 200, status: 'completed', timestamp: date },
        { id: '3', amount: 150, status: 'failed', timestamp: date },
      ];

      const analysis = await this.llmService.analyzeTransactionData(transactions);

      return {
        date,
        summary: {
          totalTransactions: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
          successRate: this.calculateSuccessRate(transactions),
        },
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        trends: analysis.trends,
      };
    } catch (error) {
      this.logger.error(`日報生成失敗: ${error.message}`);
      throw new Error('無法生成日報');
    }
  }

  async generateWeeklyReport(startDate: string, endDate: string): Promise<any> {
    try {
      // 模擬週報數據
      const transactions = [
        { id: '1', amount: 100, status: 'completed', timestamp: startDate },
        { id: '2', amount: 200, status: 'completed', timestamp: endDate },
      ];

      const analysis = await this.llmService.analyzeTransactionData(transactions);

      return {
        period: { startDate, endDate },
        summary: {
          totalTransactions: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
          averageDailyTransactions: transactions.length / 7,
          successRate: this.calculateSuccessRate(transactions),
        },
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        trends: analysis.trends,
      };
    } catch (error) {
      this.logger.error(`週報生成失敗: ${error.message}`);
      throw new Error('無法生成週報');
    }
  }

  async generateMonthlyReport(month: string, year: number): Promise<any> {
    try {
      // 模擬月報數據
      const transactions = [
        { id: '1', amount: 100, status: 'completed', timestamp: `${year}-${month}-01` },
        { id: '2', amount: 200, status: 'completed', timestamp: `${year}-${month}-15` },
      ];

      const analysis = await this.llmService.analyzeTransactionData(transactions);

      return {
        period: { month, year },
        summary: {
          totalTransactions: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
          averageDailyTransactions: transactions.length / 30,
          successRate: this.calculateSuccessRate(transactions),
        },
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        trends: analysis.trends,
      };
    } catch (error) {
      this.logger.error(`月報生成失敗: ${error.message}`);
      throw new Error('無法生成月報');
    }
  }

  private calculateSuccessRate(transactions: any[]): number {
    const successfulTransactions = transactions.filter(
      t => t.status === 'completed'
    ).length;
    return transactions.length > 0 
      ? (successfulTransactions / transactions.length) * 100 
      : 0;
  }
}
