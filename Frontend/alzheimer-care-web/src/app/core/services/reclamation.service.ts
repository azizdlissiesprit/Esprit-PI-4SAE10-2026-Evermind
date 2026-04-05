import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateCommentRequest,
  CreateReclamationRequest,
  Reclamation,
  ReclamationAttachment,
  ReclamationComment,
  ReclamationHistoryEvent,
  ReclamationNotification,
  ReclamationStatus,
  UpdateReclamationRequest
} from '../models/reclamation.model';

@Injectable({ providedIn: 'root' })
export class ReclamationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/reclamation/api/reclamations';

  createReclamation(request: CreateReclamationRequest): Observable<Reclamation> {
    return this.http.post<Reclamation>(this.baseUrl, request);
  }

  updateReclamation(id: number, request: UpdateReclamationRequest): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.baseUrl}/${id}`, request);
  }

  getReclamationById(id: number): Observable<Reclamation> {
    return this.http.get<Reclamation>(`${this.baseUrl}/${id}`);
  }

  getAllReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(this.baseUrl);
  }

  getMyReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.baseUrl}/me`);
  }

  getReclamationsByUserId(userId: number): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.baseUrl}/user/${userId}`);
  }

  getReclamationsByStatus(status: ReclamationStatus): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.baseUrl}/status/${status}`);
  }

  countByStatus(status: ReclamationStatus): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/${status}`);
  }

  deleteReclamation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getHistory(reclamationId: number): Observable<ReclamationHistoryEvent[]> {
    return this.http.get<ReclamationHistoryEvent[]>(`${this.baseUrl}/${reclamationId}/history`);
  }

  getComments(reclamationId: number): Observable<ReclamationComment[]> {
    return this.http.get<ReclamationComment[]>(`${this.baseUrl}/${reclamationId}/comments`);
  }

  addComment(reclamationId: number, request: CreateCommentRequest): Observable<ReclamationComment> {
    return this.http.post<ReclamationComment>(`${this.baseUrl}/${reclamationId}/comments`, request);
  }

  getAttachments(reclamationId: number): Observable<ReclamationAttachment[]> {
    return this.http.get<ReclamationAttachment[]>(`${this.baseUrl}/${reclamationId}/attachments`);
  }

  uploadAttachment(reclamationId: number, file: File | Blob, fileName?: string): Observable<ReclamationAttachment> {
    const formData = new FormData();
    const uploadName = file instanceof File ? file.name : fileName || 'attachment.bin';
    formData.append('file', file, uploadName);
    return this.http.post<ReclamationAttachment>(`${this.baseUrl}/${reclamationId}/attachments`, formData);
  }

  downloadAttachment(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }

  deleteAttachment(attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/attachments/${attachmentId}`);
  }

  getMyNotifications(): Observable<ReclamationNotification[]> {
    return this.http.get<ReclamationNotification[]>(`${this.baseUrl}/notifications/me`);
  }

  getAdminNotifications(): Observable<ReclamationNotification[]> {
    return this.http.get<ReclamationNotification[]>(`${this.baseUrl}/notifications/admin`);
  }

  getMyUnreadNotificationCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/notifications/me/unread-count`);
  }

  getAdminUnreadNotificationCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/notifications/admin/unread-count`);
  }

  markNotificationAsRead(notificationId: number): Observable<ReclamationNotification> {
    return this.http.patch<ReclamationNotification>(
      `${this.baseUrl}/notifications/${notificationId}/read`,
      {}
    );
  }
}
