import { HttpInterceptorFn } from '@angular/common/http';

export const reclamationInterceptor: HttpInterceptorFn = (req, next) => {
  // Intercepteur pour les réclamations (peut être utilisé pour ajouter des headers spécifiques, etc.)
  return next(req);
};
