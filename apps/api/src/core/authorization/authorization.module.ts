import { Injectable, Module } from '@nestjs/common';
import { schoolSession } from '@orison/auth';

@Injectable()
export class AuthorizationService {
  allows(role: string, menuKey: string) {
    const menu = schoolSession(role).menu;
    return menu == null || menu.includes(menuKey);
  }
}

@Module({ providers: [AuthorizationService], exports: [AuthorizationService] })
export class AuthorizationModule {}
