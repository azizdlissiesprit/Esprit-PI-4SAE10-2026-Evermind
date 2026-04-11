import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RendezVousDTO {
  id?: number;
  patientNom: string;
  patientPrenom: string;
  type: 'CONSULTATION' | 'TELECONSULTATION' | 'SUIVI' | 'BILAN' | 'EVALUATION' | 'RESULTATS' | 'PREMIERE_VISITE';
  statut: 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE' | 'LIBRE';
  dateHeure: string;
  dateHeureString?: string;
  dureeMinutes: number;
  notes?: string;
  googleEventId?: string;
}

export interface RendezVousStats {
  totalJour: number;
  totalSemaine: number;
  confirmes: number;
  enAttente: number;
  annules: number;
  tauxConfirmation: number;
}

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private apiUrl = 'http://localhost:8080/api/rendezvous';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) {}

  // CRUD Operations
  getAll(): Observable<RendezVousDTO[]> {
    return this.http.get<RendezVousDTO[]>(this.apiUrl);
  }

  getById(id: number): Observable<RendezVousDTO> {
    return this.http.get<RendezVousDTO>(`${this.apiUrl}/${id}`);
  }

  getByDay(date: string): Observable<RendezVousDTO[]> {
    return this.http.get<RendezVousDTO[]>(`${this.apiUrl}/jour/${date}`);
  }

  getByWeek(date: string): Observable<RendezVousDTO[]> {
    return this.http.get<RendezVousDTO[]>(`${this.apiUrl}/semaine/${date}`);
  }

  create(rendezVous: RendezVousDTO): Observable<RendezVousDTO> {
    return this.http.post<RendezVousDTO>(this.apiUrl, rendezVous, this.httpOptions);
  }

  update(id: number, rendezVous: RendezVousDTO): Observable<RendezVousDTO> {
    return this.http.put<RendezVousDTO>(`${this.apiUrl}/${id}`, rendezVous, this.httpOptions);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Statistics
  getStats(): Observable<RendezVousStats> {
    return this.http.get<RendezVousStats>(`${this.apiUrl}/stats`);
  }

  // Search
  search(term: string): Observable<RendezVousDTO[]> {
    return this.http.get<RendezVousDTO[]>(`${this.apiUrl}/search?term=${term}`);
  }
}
