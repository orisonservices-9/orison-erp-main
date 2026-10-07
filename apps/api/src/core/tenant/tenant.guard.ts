import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { apiConfig } from '@orison/config';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.orison = {
      ...(request.orison || {}),
      schoolId: request.orison?.role === 'platform_admin' ? null : apiConfig.schoolName,
    };
    return true;
  }
}
