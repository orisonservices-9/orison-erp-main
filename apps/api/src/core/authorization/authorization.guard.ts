import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AREA_KEY } from './area.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const area = this.reflector.get<string>(AREA_KEY, context.getClass()) || 'school';
    const role = context.switchToHttp().getRequest().orison?.role;
    if (area === 'platform' && role !== 'platform_admin') {
      throw new ForbiddenException('This area is for platform administrators.');
    }
    if (area === 'school' && role === 'platform_admin') {
      throw new ForbiddenException('Platform administrators use the platform workspace.');
    }
    return true;
  }
}
