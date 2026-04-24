import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenLocalStorageService } from '../services/token-local-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isPublicAuthRoute =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/login-with-face') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/register-with-face') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password') ||
    req.url.includes('/auth/verify');

  // Public auth routes must not include Authorization.
  if (isPublicAuthRoute) {
    return next(req);
  }

  const tokenStorage = inject(TokenLocalStorageService);
  const token = tokenStorage.getToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
