import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { SchoolStore } from '../../core/database/school-store.service';

const PREFIXES = ["students","student-promotion-request","admission-leads"];

@Injectable()
export class StudentsRepository {
  constructor(@Inject(SchoolStore) private readonly store: SchoolStore) {}

  handle(method: string, url: string, body: unknown, query: Record<string, unknown>) {
    const path = url.split('?')[0];
    const allowed = PREFIXES.some((prefix) => path === `/api/${prefix}` || path.startsWith(`/api/${prefix}/`));
    if (!allowed) throw new ForbiddenException('This module cannot read another domain.');
    return this.store.handle(method, url, body, query);
  }
}
