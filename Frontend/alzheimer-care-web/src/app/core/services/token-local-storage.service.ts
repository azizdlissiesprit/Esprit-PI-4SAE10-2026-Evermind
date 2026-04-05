import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthenticationResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class TokenLocalStorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Token management
  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  removeToken(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  // User data management
  saveUserData(user: AuthenticationResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      if (user.token) {
        this.saveToken(user.token);
      }
    }
  }

  getUserData(): AuthenticationResponse | null {
    if (this.isBrowser) {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  getUserId(): number | null {
    const user = this.getUserData();
    return user ? user.userId : null;
  }

  getUserEmail(): string | null {
    const user = this.getUserData();
    return user ? user.email : null;
  }

  getUserRole(): string | null {
    const user = this.getUserData();
    return user ? user.role : null;
  }

  getUserFullName(): string | null {
    const user = this.getUserData();
    return user ? `${user.firstName} ${user.lastName}` : null;
  }

  isLoggedIn(): boolean {
    return this.hasToken() && this.getUserData() !== null;
  }

  // Clear all data
  clearAll(): void {
    if (this.isBrowser) {
      this.removeToken();
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('ADMIN') || this.hasRole('ROLE_ADMIN');
  }

  // Check if user is medecin
  isMedecin(): boolean {
    return this.hasRole('MEDECIN') || this.hasRole('ROLE_MEDECIN');
  }

  // Check if user is aidant
  isAidant(): boolean {
    return this.hasRole('AIDANT') || this.hasRole('ROLE_AIDANT');
  }

  // Check if user is responsable
  isResponsable(): boolean {
    return this.hasRole('RESPONSABLE') || this.hasRole('ROLE_RESPONSABLE');
  }
}
