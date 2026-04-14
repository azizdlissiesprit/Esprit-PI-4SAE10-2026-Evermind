import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VideoRoomResponse {
  roomUrl: string;
  roomName: string;
  rendezVousId: number;
}

@Injectable({ providedIn: 'root' })
export class VideoService {
  private apiUrl = 'http://localhost:8080/api/video';

  constructor(private http: HttpClient) {}

  createRoom(rendezVousId: number, patientName: string): Observable<VideoRoomResponse> {
    return this.http.post<VideoRoomResponse>(`${this.apiUrl}/room`, {
      rendezVousId,
      patientName
    });
  }

  getRoom(rendezVousId: number): Observable<VideoRoomResponse> {
    return this.http.get<VideoRoomResponse>(`${this.apiUrl}/room/${rendezVousId}`);
  }

  getToken(roomName: string, userName: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/token?roomName=${roomName}&userName=${userName}`, {}
    );
  }
}
