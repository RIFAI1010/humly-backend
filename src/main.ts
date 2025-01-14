import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import path, { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// console.log('Static Assets Path:', join(__dirname, '../..', 'uploads'));

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.use(cookieParser());
  app.useStaticAssets(join(__dirname, '../..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.use('/tes', function (req, res, next) {
    res.send('Hello World!');
  });

  await app.listen(process.env.PORT ?? 4496);
}
bootstrap();
