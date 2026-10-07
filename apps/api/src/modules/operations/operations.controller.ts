import { All, Controller, Inject, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Area } from '../../core/authorization/area.decorator';
import { AuthorizationGuard } from '../../core/authorization/authorization.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { OperationsService } from './operations.service';

@Controller('api')
@Area('school')
@UseGuards(AuthGuard, TenantGuard, AuthorizationGuard)
export class OperationsController {
  constructor(@Inject(OperationsService) private readonly operations: OperationsService) {}

  @All('visitors')
  operations0_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('visitors/*')
  operations0_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('visitors/*/*')
  operations0_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('visitors/*/*/*')
  operations0_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('parent-center')
  operations1_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('parent-center/*')
  operations1_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('parent-center/*/*')
  operations1_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('parent-center/*/*/*')
  operations1_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('inventory')
  operations2_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('inventory/*')
  operations2_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('inventory/*/*')
  operations2_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('inventory/*/*/*')
  operations2_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('expenses')
  operations3_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('expenses/*')
  operations3_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('expenses/*/*')
  operations3_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('expenses/*/*/*')
  operations3_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('branches')
  operations4_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('branches/*')
  operations4_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('branches/*/*')
  operations4_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  private dispatch(request: Request) {
    return this.operations.handle(request);
  }
}
