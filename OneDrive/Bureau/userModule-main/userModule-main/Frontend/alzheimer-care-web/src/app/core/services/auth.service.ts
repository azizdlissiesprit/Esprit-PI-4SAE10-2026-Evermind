import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  AuthenticationResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../models/auth.models';

type Role = AuthenticationResponse extends { role: infer R }
  ? R
  : 'AIDANT' | 'MEDECIN' | 'RESPONSABLE' | 'ADMIN';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = '/auth';

  private readonly TOKEN_KEY = 'token';
  private readonly LEGACY_TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'currentUser';
  private readonly ROLE_KEY = 'role';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? window.localStorage : null;
  }

  private setItem(key: string, value: string): void {
    this.storage?.setItem(key, value);
  }

  private getItem(key: string): string | null {
    return this.storage?.getItem(key) ?? null;
  }

  private removeItem(key: string): void {
    this.storage?.removeItem(key);
  }

  register(request: RegisterRequest): Observable<AuthenticationResponse> {
    return this.registerWithFace(request, null);
  }

  registerWithFace(
    request: RegisterRequest,
    faceImage: File | null
  ): Observable<AuthenticationResponse> {
    const formData = new FormData();
    formData.append('firstName', request.firstName);
    formData.append('lastName', request.lastName);
    formData.append('email', request.email);
    formData.append('password', request.password);
    formData.append('phoneNumber', request.phoneNumber);
    formData.append('userType', request.userType);

    if (faceImage) {
      formData.append('faceImage', faceImage, faceImage.name);
    }

    return this.http
      .post<AuthenticationResponse>(`${this.baseUrl}/register-with-face`, formData)
      .pipe(tap((res) => this.saveSessionFromResponse(res)));
  }

  login(request: LoginRequest): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((res) => this.saveSessionFromResponse(res)));
  }

  loginWithFace(request: LoginRequest, faceImage: File | null): Observable<AuthenticationResponse> {
    const formData = new FormData();
    formData.append('email', request.email);

    if (faceImage) {
      formData.append('faceImage', faceImage, faceImage.name);
    }

    return this.http
      .post<AuthenticationResponse>(`${this.baseUrl}/login-with-face`, formData)
      .pipe(tap((res) => this.saveSessionFromResponse(res)));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/forgot-password`, request, {
      responseType: 'text'
    });
  }

  resetPassword(request: ResetPasswordRequest): Observable<string> {
    return this.http.post(`${this.baseUrl}/reset-password`, request, {
      responseType: 'text'
    });
  }

  verifyEmail(code: string): Observable<string> {
    return this.http.get(`${this.baseUrl}/verify?code=${code}`, {
      responseType: 'text'
    });
  }

  isLoggedIn(): boolean {
    const token = this.getItem(this.TOKEN_KEY) ?? this.getItem(this.LEGACY_TOKEN_KEY);
    return !!token && token.trim().length > 0;
  }

  getToken(): string | null {
    return this.getItem(this.TOKEN_KEY) ?? this.getItem(this.LEGACY_TOKEN_KEY);
  }

  getRole(): Role | null {
    const r = this.getItem(this.ROLE_KEY);
    return (r as Role) ?? null;
  }

  getCurrentUser<T = any>(): T | null {
    const raw = this.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  logout(): void {
    this.removeItem(this.TOKEN_KEY);
    this.removeItem(this.LEGACY_TOKEN_KEY);
    this.removeItem(this.USER_KEY);
    this.removeItem(this.ROLE_KEY);
  }

  private saveSessionFromResponse(res: any): void {
    const token = res?.token || res?.accessToken || res?.jwt || res?.data?.token;

    const user =
      res?.user ||
      res?.currentUser ||
      res?.data?.user ||
      (res?.email
        ? {
            firstName: res?.firstName,
            lastName: res?.lastName,
            email: res?.email
          }
        : null);

    const role: Role | undefined =
      res?.role ||
      res?.userType ||
      res?.user?.role ||
      res?.user?.userType ||
      res?.data?.role ||
      res?.data?.userType ||
      res?.data?.user?.role ||
      res?.data?.user?.userType;

    if (token) {
      const tokenValue = String(token);
      this.setItem(this.TOKEN_KEY, tokenValue);
      this.setItem(this.LEGACY_TOKEN_KEY, tokenValue);
    }
    if (user) this.setItem(this.USER_KEY, JSON.stringify(user));
    if (role) this.setItem(this.ROLE_KEY, String(role));
  }
}
