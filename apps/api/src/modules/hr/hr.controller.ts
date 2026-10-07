import { All, Controller, Inject, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Area } from '../../core/authorization/area.decorator';
import { AuthorizationGuard } from '../../core/authorization/authorization.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { HrService } from './hr.service';

@Controller('api')
@Area('school')
@UseGuards(AuthGuard, TenantGuard, AuthorizationGuard)
export class HrController {
  constructor(@Inject(HrService) private readonly hr: HrService) {}

  @All('hr')
  hr0_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('hr/*')
  hr0_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('hr/*/*')
  hr0_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('hr/*/*/*')
  hr0_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('leaves')
  hr1_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('leaves/*')
  hr1_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('leaves/*/*')
  hr1_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('leaves/*/*/*')
  hr1_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('staff')
  hr2_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('staff/*')
  hr2_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('staff/*/*')
  hr2_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('staff/*/*/*')
  hr2_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  private dispatch(request: Request) {
    return this.hr.handle(request);
  }
}
