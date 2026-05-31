import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 0) {
        toast.error('Cannot reach the server. Check your connection.', 'Connection error');
      } else if (err.status === 401 && !req.url.includes('/auth/')) {
        auth.logout();
        toast.error('Your session expired. Sign in again.', 'Session expired');
      }
      return throwError(() => err);
    }),
  );
};
