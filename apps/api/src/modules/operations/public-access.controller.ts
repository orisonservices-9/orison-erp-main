import { Controller, Get, Inject, Req } from '@nestjs/common';
import type { Request } from 'express';
import { SchoolStore } from '../../core/database/school-store.service';

@Controller('api/public')
export class PublicAccessController {
  constructor(@Inject(SchoolStore) private readonly store: SchoolStore) {}

  @Get('visitor-pass/:token')
  visitorPass(@Req() request: Request) {
    return this.store.handle(request.method, request.originalUrl, request.body, request.query as Record<string, any>);
  }
}
