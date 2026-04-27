import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, timeout } from 'rxjs';
import { Categorie } from '../models/categorie.model';

@Injectable({
  providedIn: 'root',
})
export class CategorieService {
  private apiUrl = 'http://localhost:8090/stock/api/categories';
  private readonly requestTimeoutMs = 10000;

  constructor(private http: HttpClient) {}

  listerTout(): Observable<Categorie[]> {
    return this.http
      .get<Categorie[]>(this.apiUrl)
      .pipe(timeout(this.requestTimeoutMs), retry({ count: 1, delay: 250 }));
  }

  obtenirParId(id: number): Observable<Categorie> {
    return this.http
      .get<Categorie>(`${this.apiUrl}/${id}`)
      .pipe(timeout(this.requestTimeoutMs), retry({ count: 1, delay: 250 }));
  }

  creer(categorie: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, categorie).pipe(timeout(this.requestTimeoutMs));
  }

  modifier(id: number, categorie: Categorie): Observable<Categorie> {
    return this.http
      .put<Categorie>(`${this.apiUrl}/${id}`, categorie)
      .pipe(timeout(this.requestTimeoutMs));
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(timeout(this.requestTimeoutMs));
  }
}
