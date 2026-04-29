import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, timeout } from 'rxjs';
import { Produit } from '../models/produit.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProduitService {
  private apiUrl = `${environment.apiUrl}/stock/api/produits`;
  private readonly requestTimeoutMs = 10000;

  constructor(private http: HttpClient) {}

  listerTout(): Observable<Produit[]> {
    return this.http
      .get<Produit[]>(this.apiUrl)
      .pipe(timeout(this.requestTimeoutMs), retry({ count: 1, delay: 250 }));
  }

  listerParCategorie(categorieId: number): Observable<Produit[]> {
    return this.http
      .get<Produit[]>(`${this.apiUrl}/categorie/${categorieId}`)
      .pipe(timeout(this.requestTimeoutMs), retry({ count: 1, delay: 250 }));
  }

  obtenirParId(id: number): Observable<Produit> {
    return this.http
      .get<Produit>(`${this.apiUrl}/${id}`)
      .pipe(timeout(this.requestTimeoutMs), retry({ count: 1, delay: 250 }));
  }

  creer(produit: Produit): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl, produit).pipe(timeout(this.requestTimeoutMs));
  }

  modifier(id: number, produit: Produit): Observable<Produit> {
    return this.http
      .put<Produit>(`${this.apiUrl}/${id}`, produit)
      .pipe(timeout(this.requestTimeoutMs));
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(timeout(this.requestTimeoutMs));
  }

  uploaderImage(id: number, fichier: File): Observable<Produit> {
    const formData = new FormData();
    formData.append('fichier', fichier);
    return this.http
      .post<Produit>(`${this.apiUrl}/${id}/image`, formData)
      .pipe(timeout(this.requestTimeoutMs));
  }

  supprimerImage(id: number): Observable<Produit> {
    return this.http
      .delete<Produit>(`${this.apiUrl}/${id}/image`)
      .pipe(timeout(this.requestTimeoutMs));
  }
}
