import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Skip guard on server side
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    const token = this.authService.getToken();

    if (token) {
      // Check if user has required role if specified in route
      if (route.data['roles']) {
        const userRole = this.authService.getUserRole();
        if (route.data['roles'].includes(userRole)) {
          return true;
        } else {
          // User doesn't have required role
          this.router.navigate(['/auth/login']);
          return false;
        }
      }
      return true;
    } else {
      // No token, redirect to login
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}
