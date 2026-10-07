import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ROLE_SESSIONS } from '@orison/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const header = String(request.headers.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const role = token.split('.')[1] || '';
    const session = ROLE_SESSIONS[role];
    if (!session || !token.startsWith('ts-jwt.')) {
      throw new UnauthorizedException('Sign in is required.');
    }
    request.orison = { role, name: session.name };
    return true;
  }
}
