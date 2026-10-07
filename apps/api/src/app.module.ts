import { Module } from '@nestjs/common';
import { AuthorizationModule } from './core/authorization/authorization.module';
import { CacheModule } from './core/cache/cache.module';
import { ConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { EntitlementModule } from './core/entitlement/entitlement.module';
import { LoggingModule } from './core/logging/logging.module';
import { ObservabilityModule } from './core/observability/observability.module';
import { OutboxModule } from './core/outbox/outbox.module';
import { TenantModule } from './core/tenant/tenant.module';
import { ExternalServicesModule } from './infrastructure/external-services/external-services.module';
import { NotificationsModule } from './infrastructure/notifications/notifications.module';
import { PaymentsModule } from './infrastructure/payments/payments.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { AcademicModule } from './modules/academic/academic.module';
import { CommunicationsModule } from './modules/communications/communications.module';
import { FinanceModule } from './modules/finance/finance.module';
import { HrModule } from './modules/hr/hr.module';
import { IdentityModule } from './modules/identity/identity.module';
import { OperationsModule } from './modules/operations/operations.module';
import { PlatformModule } from './modules/platform/platform.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';

@Module({
  imports: [
    ConfigModule,
    LoggingModule,
    DatabaseModule,
    CacheModule,
    OutboxModule,
    TenantModule,
    AuthorizationModule,
    EntitlementModule,
    ObservabilityModule,
    IdentityModule,
    PlatformModule,
    StudentsModule,
    TeachersModule,
    AcademicModule,
    FinanceModule,
    HrModule,
    OperationsModule,
    CommunicationsModule,
    ReportingModule,
    StorageModule,
    NotificationsModule,
    PaymentsModule,
    ExternalServicesModule,
  ],
})
export class AppModule {}
