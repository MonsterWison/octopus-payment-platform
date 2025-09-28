import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 啟用CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // 啟用全域驗證管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const port = 3001;
  await app.listen(port);
  console.log(`🚀 八達通支付後端服務已啟動在端口 ${port}`);
}

bootstrap();