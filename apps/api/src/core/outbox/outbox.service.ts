import { Injectable } from '@nestjs/common';
import { logger } from '@orison/logger';

export interface OutboxJob {
  name: string;
  payload: unknown;
  createdAt: string;
}

@Injectable()
export class OutboxService {
  private readonly jobs: OutboxJob[] = [];

  enqueue(name: string, payload: unknown) {
    const job = { name, payload, createdAt: new Date().toISOString() };
    this.jobs.push(job);
    logger.info('Outbox job recorded for the worker', { name });
    return job;
  }

  pending() {
    return this.jobs;
  }
}
