import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinancePolicy } from './finance.policy';
import { FinanceRepository } from './finance.repository';
import { FinanceService } from './finance.service';

@Module({
  controllers: [FinanceController],
  providers: [FinanceService, FinanceRepository, FinancePolicy],
  exports: [FinanceService],
})
export class FinanceModule {}
