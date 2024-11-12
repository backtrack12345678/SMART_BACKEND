import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://127.0.0.1:8000', // Ganti dengan domain yang diizinkan
    methods: '*',
    credentials: true, // Jika Anda perlu mengizinkan cookies
  });
  await app.listen(3000);
}
bootstrap();
