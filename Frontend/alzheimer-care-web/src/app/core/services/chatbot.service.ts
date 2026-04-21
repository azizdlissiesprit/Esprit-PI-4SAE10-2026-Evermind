import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatbotRequest {
  userId: number;
  question: string;
}

export interface ChatbotResponse {
  interactionId: number;
  question: string;
  answer: string;
  generatedSql: string | null;
  databaseQueried: string | null;
  timestamp: string;
  success: boolean;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private baseUrl = `${environment.apiUrl}/chatbot`;

  constructor(private http: HttpClient) {}

  ask(request: ChatbotRequest): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.baseUrl}/ask`, request);
  }

  getHistory(userId: number): Observable<ChatbotResponse[]> {
    return this.http.get<ChatbotResponse[]>(`${this.baseUrl}/history/${userId}`);
  }

  clearHistory(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/history/${userId}`);
  }
}
