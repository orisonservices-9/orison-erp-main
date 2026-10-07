import { Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { OutboxService } from '../../core/outbox/outbox.service';
import { OperationsRepository } from './operations.repository';

@Injectable()
export class OperationsService {
  constructor(
    @Inject(OperationsRepository) private readonly repository: OperationsRepository,
    @Inject(OutboxService) private readonly outbox: OutboxService,
  ) {}

  handle(request: Request) {
    if (request.method !== 'GET' && request.originalUrl.includes('/payroll/run')) {
      this.outbox.enqueue('payroll.process', request.body);
    }
    if (request.method === 'POST' && /\/(homework|leaves|fees)\b/.test(request.originalUrl)) {
      this.outbox.enqueue('operations.changed', { path: request.originalUrl });
    }
    return this.repository.handle(request.method, request.originalUrl, request.body, request.query as Record<string, unknown>);
  }
}
