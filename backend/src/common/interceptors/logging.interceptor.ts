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
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`${method} ${url} ${res.statusCode} - ${ms}ms`);
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
