import { Module } from '@nestjs/common';
import { HrController } from './hr.controller';
import { HrPolicy } from './hr.policy';
import { HrRepository } from './hr.repository';
import { HrService } from './hr.service';

@Module({
  controllers: [HrController],
  providers: [HrService, HrRepository, HrPolicy],
  exports: [HrService],
})
export class HrModule {}
