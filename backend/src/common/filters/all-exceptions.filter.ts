import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type HttpExceptionResponse = string | { message?: string | string[] };

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const httpResponse = httpContext.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message = exceptionResponse as HttpExceptionResponse;
    const errorMessage =
      typeof message === 'string'
        ? message
        : ((Array.isArray(message.message)
            ? message.message[0]
            : message.message) ?? 'Internal server error');

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    httpResponse.status(status).json({
      statusCode: status,
      message: errorMessage,
      error: String(HttpStatus[status] ?? 'Error'),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
