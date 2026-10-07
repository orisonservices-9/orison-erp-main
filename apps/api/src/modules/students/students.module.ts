import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsPolicy } from './students.policy';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, StudentsRepository, StudentsPolicy],
  exports: [StudentsService],
})
export class StudentsModule {}
