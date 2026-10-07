import { Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { OutboxService } from '../../core/outbox/outbox.service';
import { FinanceRepository } from './finance.repository';

@Injectable()
export class FinanceService {
  constructor(
    @Inject(FinanceRepository) private readonly repository: FinanceRepository,
    @Inject(OutboxService) private readonly outbox: OutboxService,
  ) {}

  handle(request: Request) {
    if (request.method !== 'GET' && request.originalUrl.includes('/payroll/run')) {
      this.outbox.enqueue('payroll.process', request.body);
    }
    if (request.method === 'POST' && /\/(homework|leaves|fees)\b/.test(request.originalUrl)) {
      this.outbox.enqueue('finance.changed', { path: request.originalUrl });
    }
    return this.repository.handle(request.method, request.originalUrl, request.body, request.query as Record<string, unknown>);
  }
}
