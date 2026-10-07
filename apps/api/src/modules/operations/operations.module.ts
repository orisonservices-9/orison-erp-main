import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { PublicAccessController } from './public-access.controller';
import { OperationsPolicy } from './operations.policy';
import { OperationsRepository } from './operations.repository';
import { OperationsService } from './operations.service';

@Module({
  controllers: [OperationsController, PublicAccessController],
  providers: [OperationsService, OperationsRepository, OperationsPolicy],
  exports: [OperationsService],
})
export class OperationsModule {}
