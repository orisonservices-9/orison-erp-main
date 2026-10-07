import { Controller, Get } from '@nestjs/common';

@Controller('api/health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'healthy',
      service: 'Orison School ERP API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
