import { NestFactory } from '@nestjs/core';
import { SimpleAppModule } from './simple-app.module';

async function bootstrap() {
  const app = await NestFactory.create(SimpleAppModule);
  
  // 啟用CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Backend service running on http://localhost:${port}`);
  console.log(`📊 Demo mode: ENABLED`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start backend service:', error);
  process.exit(1);
});