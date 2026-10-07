import { All, Controller, Inject, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Area } from '../../core/authorization/area.decorator';
import { AuthorizationGuard } from '../../core/authorization/authorization.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { StudentsService } from './students.service';

@Controller('api')
@Area('school')
@UseGuards(AuthGuard, TenantGuard, AuthorizationGuard)
export class StudentsController {
  constructor(@Inject(StudentsService) private readonly students: StudentsService) {}

  @All('students')
  students0_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('students/*')
  students0_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('students/*/*')
  students0_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('students/*/*/*')
  students0_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('student-promotion-request')
  students1_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('student-promotion-request/*')
  students1_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('student-promotion-request/*/*')
  students1_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('student-promotion-request/*/*/*')
  students1_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('admission-leads')
  students2_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('admission-leads/*')
  students2_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  private dispatch(request: Request) {
    return this.students.handle(request);
  }
}
