import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred.';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network Error: ${error.error.message}`;
      } else {
        // Backend returned an unsuccessful response code
        if (error.status === 0) {
          errorMessage = 'Service Unreachable: Please check your connection or try again later.';
        } else if (error.status >= 400 && error.status < 500) {
          // You might not want to toast EVERY 4xx error (like 401 login failures handled locally),
          // but for this generic implementation we can provide the backend message or a fallback
          errorMessage = error.error?.message || `Error ${error.status}: Bad Request.`;
        } else if (error.status >= 500) {
          errorMessage = `Server Error (${error.status}): Our systems are currently experiencing issues.`;
        }
      }

      // Automatically trigger the sleek toast notification for the user
      notificationService.error(errorMessage, 6000);

      // Still throw the error so individual components can catch it if needed
      return throwError(() => error);
    })
  );
};
