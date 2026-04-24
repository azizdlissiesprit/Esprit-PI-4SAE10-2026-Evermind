import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { ApplicationRef, inject, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

export const zoneInterceptor: HttpInterceptorFn = (req, next) => {
  const zone = inject(NgZone);
  const appRef = inject(ApplicationRef);

  return new Observable<HttpEvent<unknown>>((observer) => {
    const subscription = next(req).subscribe({
      next: (event) =>
        zone.run(() => {
          observer.next(event);
          appRef.tick();
        }),
      error: (error) =>
        zone.run(() => {
          observer.error(error);
          appRef.tick();
        }),
      complete: () =>
        zone.run(() => {
          observer.complete();
          appRef.tick();
        })
    });

    return () => subscription.unsubscribe();
  });
};
