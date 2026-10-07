import { All, Controller, Inject, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Area } from '../../core/authorization/area.decorator';
import { AuthorizationGuard } from '../../core/authorization/authorization.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { TeachersService } from './teachers.service';

@Controller('api')
@Area('school')
@UseGuards(AuthGuard, TenantGuard, AuthorizationGuard)
export class TeachersController {
  constructor(@Inject(TeachersService) private readonly teachers: TeachersService) {}

  @All('teachers')
  teachers0_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teachers/*')
  teachers0_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teachers/*/*')
  teachers0_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teachers/*/*/*')
  teachers0_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teachers-template')
  teachers1_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teachers-template/*')
  teachers1_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teachers-template/*/*')
  teachers1_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teachers-template/*/*/*')
  teachers1_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-allocations')
  teachers2_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-allocations/*')
  teachers2_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-allocations/*/*')
  teachers2_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-allocations/*/*/*')
  teachers2_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  private dispatch(request: Request) {
    return this.teachers.handle(request);
  }
}
