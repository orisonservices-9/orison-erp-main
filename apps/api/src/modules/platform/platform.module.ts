import { Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { PlatformPolicy } from './platform.policy';
import { PlatformRepository } from './platform.repository';
import { PlatformService } from './platform.service';

@Module({
  controllers: [PlatformController],
  providers: [PlatformService, PlatformRepository, PlatformPolicy],
  exports: [PlatformService],
})
export class PlatformModule {}
