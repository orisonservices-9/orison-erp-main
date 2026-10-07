import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ROLE_SESSIONS } from '@orison/auth';
import { apiConfig } from '@orison/config';
import type { SchoolSession } from '@orison/types';

@Injectable()
export class AuthService {
  login(role: string): SchoolSession {
    const session = ROLE_SESSIONS[role];
    if (!session) throw new UnauthorizedException('That workspace is not available.');
    return {
      token: `ts-jwt.${role}.${Date.now()}`,
      role,
      name: session.name,
      menu: session.menu,
      schoolId: role === 'platform_admin' ? 'Orison Platform' : apiConfig.schoolName,
    };
  }
}
