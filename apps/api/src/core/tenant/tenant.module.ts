import { Injectable, Module } from '@nestjs/common';
import { apiConfig } from '@orison/config';

@Injectable()
export class TenantService {
  current() {
    return { schoolId: apiConfig.schoolName, academicYear: apiConfig.academicYear };
  }
}

@Module({ providers: [TenantService], exports: [TenantService] })
export class TenantModule {}
