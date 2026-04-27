import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Conversation, Message, SendMessageDTO, UserDTO } from '../models/communication.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private baseUrl = environment.apiUrl; // Conversation Service Port
  private userUrl = `${environment.apiUrl}/user`; // User Service Port

  constructor(private http: HttpClient) { }

  getConversationsByUser(userId: number): Observable<Conversation[]> {
    console.log(`Fetching conversations for user ${userId}`);
    return this.http.get<Conversation[]>(`${this.baseUrl}/conversation/user/${userId}`).pipe(
      tap(data => console.log('Conversations received:', data))
    );
  }

  getMessagesByConversation(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/message/conversation/${conversationId}`);
  }

  sendMessage(dto: SendMessageDTO): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/message/send`, dto);
  }

  markAsRead(conversationId: number, userId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/message/mark-as-read/${conversationId}/${userId}`, {});
  }

  // New method to fetch all users for starting new conversations
  getAvailableUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.userUrl}/retrieve-all-users`).pipe(
      tap(data => console.log('Users received:', data))
    );
  }
}
