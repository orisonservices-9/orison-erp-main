import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingPolicy } from './reporting.policy';
import { ReportingRepository } from './reporting.repository';
import { ReportingService } from './reporting.service';

@Module({
  controllers: [ReportingController],
  providers: [ReportingService, ReportingRepository, ReportingPolicy],
  exports: [ReportingService],
})
export class ReportingModule {}
