import { Module } from '@nestjs/common';
import { AcademicController } from './academic.controller';
import { AcademicPolicy } from './academic.policy';
import { AcademicRepository } from './academic.repository';
import { AcademicService } from './academic.service';

@Module({
  controllers: [AcademicController],
  providers: [AcademicService, AcademicRepository, AcademicPolicy],
  exports: [AcademicService],
})
export class AcademicModule {}
