import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthenticationResponse } from '../models/auth.models';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  register(request: RegisterRequest): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`${this.baseUrl}/register`, request)
      .pipe(tap((response) => this.saveToken(response)));
  }

  login(request: LoginRequest): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((response) => this.saveToken(response)));
  }
  getUserRole(): string | null {
    // Check if we are in the browser
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('user_role');
    }
    return null; // Return null if on server
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
  }

  // Helper to save token to browser storage
  private saveToken(response: AuthenticationResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user_role', response.role);
        // Save other details for the profile
        localStorage.setItem('first_name', response.firstName);
        localStorage.setItem('last_name', response.lastName);
        localStorage.setItem('email', response.email);
        if (response.userId) {
          localStorage.setItem('userId', response.userId.toString());
        }
      }
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getUserId(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      const userIdStr = localStorage.getItem('userId');
      if (userIdStr) {
        return parseInt(userIdStr, 10);
      }
    }
    return null;
  }

  getDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/doctors`);
  }
}
