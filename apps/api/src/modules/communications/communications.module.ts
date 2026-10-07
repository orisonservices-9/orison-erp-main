import { Module } from '@nestjs/common';
import { CommunicationsController } from './communications.controller';
import { CommunicationsPolicy } from './communications.policy';
import { CommunicationsRepository } from './communications.repository';
import { CommunicationsService } from './communications.service';

@Module({
  controllers: [CommunicationsController],
  providers: [CommunicationsService, CommunicationsRepository, CommunicationsPolicy],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
