import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersPolicy } from './teachers.policy';
import { TeachersRepository } from './teachers.repository';
import { TeachersService } from './teachers.service';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService, TeachersRepository, TeachersPolicy],
  exports: [TeachersService],
})
export class TeachersModule {}
