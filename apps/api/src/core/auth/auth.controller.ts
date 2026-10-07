import { Body, Controller, Get, Headers, Inject, Post } from '@nestjs/common';
import { loginBodySchema } from '@orison/validation';
import { ROLE_SESSIONS } from '@orison/auth';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: unknown) {
    const parsed = loginBodySchema.parse(body ?? {});
    return this.auth.login(parsed.role);
  }

  @Get('me')
  me(@Headers('authorization') authorization = '') {
    const token = authorization.replace('Bearer ', '');
    const role = token.split('.')[1] || '';
    const session = ROLE_SESSIONS[role];
    if (!session) return { role: '', name: '', menu: [] };
    return { role, name: session.name, menu: session.menu };
  }
}
