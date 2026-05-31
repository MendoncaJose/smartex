import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`${method} ${url} ${response.statusCode} - ${ms}ms`);
      }),
      catchError((error: unknown) => {
        const ms = Date.now() - start;
        const status = error instanceof HttpException ? error.getStatus() : 500;
        const message = error instanceof Error ? error.message : String(error);

        this.logger.warn(`${method} ${url} ${status} - ${ms}ms - ${message}`);

        return throwError(() => error);
      }),
    );
  }
}
