import { All, Controller, Inject, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Area } from '../../core/authorization/area.decorator';
import { AuthorizationGuard } from '../../core/authorization/authorization.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { CommunicationsService } from './communications.service';

@Controller('api')
@Area('school')
@UseGuards(AuthGuard, TenantGuard, AuthorizationGuard)
export class CommunicationsController {
  constructor(@Inject(CommunicationsService) private readonly communications: CommunicationsService) {}

  @All('notifications')
  communications0_0(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('notifications/*')
  communications0_1(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('notifications/*/*')
  communications0_2(@Req() request: Request) {
    return this.dispatch(request);
  }

  @All('notifications/*/*/*')
  communications0_3(@Req() request: Request) {
    return this.dispatch(request);
  }

  private dispatch(request: Request) {
    return this.communications.handle(request);
  }
}
