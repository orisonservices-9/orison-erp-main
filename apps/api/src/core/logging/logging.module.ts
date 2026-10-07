import { Injectable, Module } from '@nestjs/common';
import { logger } from '@orison/logger';

@Injectable()
export class LoggingService {
  readonly logger = logger;
}

@Module({ providers: [LoggingService], exports: [LoggingService] })
export class LoggingModule {}
