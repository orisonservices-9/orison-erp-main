import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class EntitlementService {
  enabled() {
    return ['students', 'teachers', 'attendance', 'academics', 'exams', 'fees', 'hr', 'transport', 'inventory', 'reports', 'settings'];
  }
}

@Module({ providers: [EntitlementService], exports: [EntitlementService] })
export class EntitlementModule {}
