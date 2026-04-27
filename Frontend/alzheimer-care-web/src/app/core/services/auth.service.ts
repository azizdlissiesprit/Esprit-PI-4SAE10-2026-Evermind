import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError } from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  AuthenticationResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../models/auth.models';
import { environment } from '../../../environments/environment';

type Role = AuthenticationResponse extends { role: infer R }
  ? R
  : 'AIDANT' | 'MEDECIN' | 'RESPONSABLE' | 'ADMIN';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly TOKEN_KEY = 'token';
  private readonly LEGACY_TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'currentUser';
  private readonly ROLE_KEY = 'role';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private memoryStorage = new Map<string, string>();

  private get storage(): Storage | null {
    try {
      if (isPlatformBrowser(this.platformId) && window.localStorage) {
        // Test if localStorage is actually accessible (throws DOMException if blocked)
        window.localStorage.setItem('__test__', '1');
        window.localStorage.removeItem('__test__');
        return window.localStorage;
      }
    } catch (e) {
      console.warn('[AuthService] localStorage is blocked, falling back to in-memory storage', e);
    }
    return null;
  }

  private setItem(key: string, value: string): void {
    const s = this.storage;
    if (s) {
      s.setItem(key, value);
    }
    this.memoryStorage.set(key, value);
  }

  private getItem(key: string): string | null {
    const s = this.storage;
    if (s) {
      const val = s.getItem(key);
      if (val !== null) return val;
    }
    return this.memoryStorage.get(key) ?? null;
  }

  private removeItem(key: string): void {
    const s = this.storage;
    if (s) {
      s.removeItem(key);
    }
    this.memoryStorage.delete(key);
  }

  // ─── Standard Registration ─────────────────────────────────────────
  register(request: RegisterRequest): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`${this.baseUrl}/register`, request)
      .pipe(tap((res) => this.saveSessionFromResponse(res)));
  }

  // ─── Registration with Face Enrollment ─────────────────────────────
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
      console.log('[AuthService] registerWithFace - faceImage attached:', faceImage.name, 'size:', faceImage.size, 'type:', faceImage.type);
    } else {
      console.warn('[AuthService] registerWithFace - NO faceImage provided!');
    }

    const url = `${this.baseUrl}/register-with-face`;
    console.log('[AuthService] registerWithFace - POST', url, 'request:', { ...request, password: '***' });

    return this.http
      .post<AuthenticationResponse>(url, formData)
      .pipe(
        tap((res) => {
          console.log('[AuthService] registerWithFace - SUCCESS response:', res);
          this.saveSessionFromResponse(res);
        }),
        catchError((err) => {
          console.error('[AuthService] registerWithFace - ERROR status:', err?.status, 'statusText:', err?.statusText);
          console.error('[AuthService] registerWithFace - ERROR body:', err?.error);
          console.error('[AuthService] registerWithFace - ERROR full:', err);
          throw err;
        })
      );
  }

  // ─── Standard Login ────────────────────────────────────────────────
  login(request: LoginRequest): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((res) => this.saveSessionFromResponse(res)));
  }

  // ─── Login with Face Verification ──────────────────────────────────
  loginWithFace(request: LoginRequest, faceImage: File | null): Observable<AuthenticationResponse> {
    const formData = new FormData();
    formData.append('email', request.email);

    if (faceImage) {
      formData.append('faceImage', faceImage, faceImage.name);
      console.log('[AuthService] loginWithFace - faceImage attached:', faceImage.name, 'size:', faceImage.size, 'type:', faceImage.type);
    } else {
      console.warn('[AuthService] loginWithFace - NO faceImage provided!');
    }

    const url = `${this.baseUrl}/login-with-face`;
    console.log('[AuthService] loginWithFace - POST', url, 'email:', request.email);

    return this.http
      .post<AuthenticationResponse>(url, formData)
      .pipe(
        tap((res) => {
          console.log('[AuthService] loginWithFace - SUCCESS response:', res);
          this.saveSessionFromResponse(res);
        }),
        catchError((err) => {
          console.error('[AuthService] loginWithFace - ERROR status:', err?.status, 'statusText:', err?.statusText);
          console.error('[AuthService] loginWithFace - ERROR body:', err?.error);
          console.error('[AuthService] loginWithFace - ERROR full:', err);
          throw err;
        })
      );
  }

  // ─── Password Reset ────────────────────────────────────────────────
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

  // ─── Session Queries ───────────────────────────────────────────────
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

  /** Alias kept for backward compatibility with existing components. */
  getUserRole(): string | null {
    return this.getItem(this.ROLE_KEY) ?? this.getItem('user_role');
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

  getUserId(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      const userIdStr = localStorage.getItem('userId');
      if (userIdStr) {
        return parseInt(userIdStr, 10);
      }
    }
    return null;
  }

  /** Fetch list of doctors from the backend. */
  getDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/doctors`);
  }

  logout(): void {
    this.removeItem(this.TOKEN_KEY);
    this.removeItem(this.LEGACY_TOKEN_KEY);
    this.removeItem(this.USER_KEY);
    this.removeItem(this.ROLE_KEY);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user_role');
      localStorage.removeItem('first_name');
      localStorage.removeItem('last_name');
      localStorage.removeItem('email');
      localStorage.removeItem('userId');
    }
  }

  // ─── Internal ──────────────────────────────────────────────────────
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
    if (role) {
      const roleValue = String(role);
      this.setItem(this.ROLE_KEY, roleValue);
      // Keep legacy key in sync for components that read it directly
      this.setItem('user_role', roleValue);
    }

    // Persist individual fields for backward compatibility
    if (res?.firstName) this.setItem('first_name', res.firstName);
    if (res?.lastName) this.setItem('last_name', res.lastName);
    if (res?.email) this.setItem('email', res.email);
    if (res?.userId) this.setItem('userId', String(res.userId));
  }
}
