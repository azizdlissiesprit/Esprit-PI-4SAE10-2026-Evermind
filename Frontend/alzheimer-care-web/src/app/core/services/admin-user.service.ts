import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// You can remove isPlatformBrowser import if not used elsewhere

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private apiUrl = 'http://localhost:8082/user/admin/search'; 
  private baseUrl = 'http://localhost:8082/user'; 

  constructor(private http: HttpClient) {} // Removed PlatformID injection as it's not needed here anymore

  getUsers(page: number, size: number, keyword: string, role: string, sortBy: string, direction: string): Observable<any> {
    
    // --- REMOVED THE BROKEN LINE HERE ---

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    if (keyword) params = params.set('keyword', keyword);
    if (role && role !== 'ALL') params = params.set('role', role);

    return this.http.get<any>(this.apiUrl, { params });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/remove-user/${id}`);
  }
    // ... existing code ...

  // GET SINGLE USER (For Edit Form)
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // UPDATE USER
  updateUser(id: number, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-user/${id}`, user);
  }
  addUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-user`, user);
  }
}