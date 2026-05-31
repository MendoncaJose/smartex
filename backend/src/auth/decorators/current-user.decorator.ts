import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface JwtUser {
  id: number;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext): JwtUser => {
    const request = executionContext
      .switchToHttp()
      .getRequest<Request & { user: JwtUser }>();
    return request.user;
  },
);
