import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminUser, UserFilters, UserStats } from '../models/admin-user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/users';

  getUsers(filters: UserFilters = {}): Observable<AdminUser[]> {
    let params = new HttpParams();

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters.userType) {
      params = params.set('userType', filters.userType);
    }

    return this.http.get<AdminUser[]>(this.baseUrl, { params });
  }

  getStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.baseUrl}/stats`);
  }

  getCurrentUser(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/me`);
  }

  getUserById(userId: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/${userId}`);
  }

  banUser(userId: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.baseUrl}/${userId}/ban`, {});
  }

  unbanUser(userId: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.baseUrl}/${userId}/unban`, {});
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }
}
