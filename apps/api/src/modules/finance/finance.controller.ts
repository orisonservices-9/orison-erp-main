import { All, Controller, Inject, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Area } from '../../core/authorization/area.decorator';
import { AuthorizationGuard } from '../../core/authorization/authorization.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { FinanceService } from './finance.service';

@Controller('api')
@Area('school')
@UseGuards(AuthGuard, TenantGuard, AuthorizationGuard)
export class FinanceController {
  constructor(@Inject(FinanceService) private readonly finance: FinanceService) {}

  @All('fees')
  finance0_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('fees/*')
  finance0_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('fees/*/*')
  finance0_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('fees/*/*/*')
  finance0_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('payments')
  finance1_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('payments/*')
  finance1_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('payments/*/*')
  finance1_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('payments/*/*/*')
  finance1_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  private dispatch(request: Request) {
    return this.finance.handle(request);
  }
}
