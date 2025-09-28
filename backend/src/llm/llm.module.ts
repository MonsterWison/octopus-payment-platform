import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { ChatService } from './chat.service';
import { AnalysisService } from './analysis.service';
import { PredictionService } from './prediction.service';
import { LlmController } from './llm.controller';

@Module({
  imports: [ConfigModule],
  controllers: [LlmController],
  providers: [LlmService, ChatService, AnalysisService, PredictionService],
  exports: [LlmService, ChatService, AnalysisService, PredictionService],
})
export class LlmModule {}
