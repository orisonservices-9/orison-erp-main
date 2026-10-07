import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { Area } from '../../core/authorization/area.decorator';
import { AuthorizationGuard } from '../../core/authorization/authorization.guard';
import { AuthGuard } from '../../core/auth/auth.guard';
import { TenantGuard } from '../../core/tenant/tenant.guard';
import { PlatformService } from './platform.service';

@Controller('api/platform')
@Area('platform')
@UseGuards(AuthGuard, TenantGuard, AuthorizationGuard)
export class PlatformController {
  constructor(@Inject(PlatformService) private readonly platform: PlatformService) {}

  @Get('schools') schools() { return this.platform.schools(); }
  @Get('plans') plans() { return this.platform.plans(); }
  @Get('subscriptions') subscriptions() { return this.platform.subscriptions(); }
  @Get('billing') billing() { return this.platform.billing(); }
  @Get('users') users() { return this.platform.users(); }
}
