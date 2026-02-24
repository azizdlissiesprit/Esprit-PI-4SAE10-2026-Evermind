
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthenticationResponse } from '../models/auth.models';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8082/auth'; // Your Spring Boot URL

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }

  register(request: RegisterRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/register`, request)
      .pipe(
        tap(response => this.saveToken(response))
      );
  }

  login(request: LoginRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/login`, request)
      .pipe(
        tap(response => this.saveToken(response))
      );
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
      }
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }
}