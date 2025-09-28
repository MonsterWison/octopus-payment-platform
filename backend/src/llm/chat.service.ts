import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private chatHistory: Map<string, any[]> = new Map();

  constructor(private readonly llmService: LlmService) {}

  async saveMessage(messageData: {
    sessionId: string;
    userMessage: string;
    botResponse: string;
    timestamp: Date;
  }): Promise<void> {
    const { sessionId, userMessage, botResponse, timestamp } = messageData;
    
    if (!this.chatHistory.has(sessionId)) {
      this.chatHistory.set(sessionId, []);
    }
    
    const history = this.chatHistory.get(sessionId);
    history.push({
      userMessage,
      botResponse,
      timestamp,
    });
    
    this.logger.log(`聊天記錄已保存: ${sessionId}`);
  }

  async getChatHistory(sessionId: string): Promise<any[]> {
    return this.chatHistory.get(sessionId) || [];
  }

  async saveFeedback(feedbackData: {
    sessionId: string;
    messageId: string;
    rating: number;
    comment?: string;
  }): Promise<void> {
    this.logger.log(`反饋已保存: ${feedbackData.sessionId}, 評分: ${feedbackData.rating}`);
    // 在實際應用中，這裡會保存到數據庫
  }
}
