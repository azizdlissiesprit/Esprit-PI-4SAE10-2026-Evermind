import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoogleEvent {
  id:      string;
  summary: string;
  start:   { dateTime: string };
  end:     { dateTime: string };
}

@Injectable({ providedIn: 'root' })
export class GoogleCalendarService {

  private readonly BASE = 'http://localhost:8080/api/google-calendar';

  constructor(private http: HttpClient) {}

  getEventsForDay(day: string): Observable<GoogleEvent[]> {
    const params = new HttpParams().set('day', day);
    return this.http.get<GoogleEvent[]>(`${this.BASE}/events`, { params });
  }
}
