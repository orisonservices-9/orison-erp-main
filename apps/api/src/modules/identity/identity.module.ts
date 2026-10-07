import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';

@Module({ imports: [AuthModule] })
export class IdentityModule {}
