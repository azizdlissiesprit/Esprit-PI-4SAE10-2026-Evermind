import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthenticationResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8082/auth'; // Your Spring Boot URL

  constructor(private http: HttpClient) { }

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

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
  }

  // Helper to save token to browser storage
  private saveToken(response: AuthenticationResponse): void {
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user_role', response.role);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}