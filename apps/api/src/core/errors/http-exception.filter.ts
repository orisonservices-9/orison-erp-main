import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { logger } from '@orison/logger';

@Catch()
export class SchoolExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const detail = exception instanceof HttpException ? exception.message : 'The school server could not complete that request.';
    if (!(exception instanceof HttpException)) logger.error('Unhandled API error', exception instanceof Error ? exception.stack : exception);
    response.status(status).json({ detail });
  }
}
