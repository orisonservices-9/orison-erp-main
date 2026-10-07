import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { apiConfig } from '@orison/config';
import { logger } from '@orison/logger';
import { AppModule } from './app.module';
import { SchoolExceptionFilter } from './core/errors/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalFilters(new SchoolExceptionFilter());
  await app.listen(apiConfig.port);
  logger.info(`Orison API listening on http://localhost:${apiConfig.port}`);
}

bootstrap();
