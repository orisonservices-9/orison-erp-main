import { Injectable, Module } from '@nestjs/common';
import { apiConfig } from '@orison/config';

@Injectable()
export class ConfigService {
  readonly values = apiConfig;
}

@Module({ providers: [ConfigService], exports: [ConfigService] })
export class ConfigModule {}
