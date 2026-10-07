import { All, Controller, Inject, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Area } from '../../core/authorization/area.decorator';
import { AuthorizationGuard } from '../../core/authorization/authorization.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { ReportingService } from './reporting.service';

@Controller('api')
@Area('school')
@UseGuards(AuthGuard, TenantGuard, AuthorizationGuard)
export class ReportingController {
  constructor(@Inject(ReportingService) private readonly reporting: ReportingService) {}

  @All('analytics')
  reporting0_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('analytics/*')
  reporting0_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('analytics/*/*')
  reporting0_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('analytics/*/*/*')
  reporting0_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('search')
  reporting1_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('search/*')
  reporting1_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('search/*/*')
  reporting1_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('search/*/*/*')
  reporting1_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('admissions-intelligence')
  reporting2_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('admissions-intelligence/*')
  reporting2_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('admissions-intelligence/*/*')
  reporting2_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('admissions-intelligence/*/*/*')
  reporting2_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('collections-intelligence')
  reporting3_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('collections-intelligence/*')
  reporting3_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('collections-intelligence/*/*')
  reporting3_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('collections-intelligence/*/*/*')
  reporting3_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-substitution-alerts')
  reporting4_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-substitution-alerts/*')
  reporting4_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-substitution-alerts/*/*')
  reporting4_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-substitution-alerts/*/*/*')
  reporting4_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-substitutions')
  reporting5_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-substitutions/*')
  reporting5_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-substitutions/*/*')
  reporting5_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('teacher-substitutions/*/*/*')
  reporting5_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  private dispatch(request: Request) {
    return this.reporting.handle(request);
  }
}
