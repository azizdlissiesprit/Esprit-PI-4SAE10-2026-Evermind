import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produit } from '../models/produit.model';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  contenu: string;
}

export interface AiChatResponse {
  reponse: string;
  produitsSugeres: Produit[];
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = `${environment.apiUrl}/stock/api/ai`;

  constructor(private http: HttpClient) {
    console.log('[AiService] Initialized with API URL:', this.apiUrl);
  }

  chat(
    message: string,
    historique: ConversationMessage[],
    langue: string
  ): Observable<AiChatResponse> {
    const payload = { message, historique, langue };
    console.log('[AiService] Sending chat request', payload);
    return this.http.post<AiChatResponse>(`${this.apiUrl}/chat`, payload).pipe(
      tap((res) => console.log('[AiService] Chat response received:', res))
    );
  }

  genererDescription(
    nomProduit: string,
    categorie: string,
    prix: number,
    langue: string
  ): Observable<string> {
    const payload = { nomProduit, categorie, prix, langue };
    console.log('[AiService] Generating description for product', payload);
    return this.http.post(
      `${this.apiUrl}/generer-description`,
      payload,
      { responseType: 'text' }
    ).pipe(tap((res) => console.log('[AiService] Description generated successfully.')));
  }
}
