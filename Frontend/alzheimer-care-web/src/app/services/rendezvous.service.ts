import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RendezVousDTO {
  id?: number;
  patientNom: string;
  patientPrenom: string;
  type: 'CONSULTATION' | 'TELECONSULTATION' | 'VIDEOCONSULTATION' | 'SUIVI' | 'BILAN' | 'EVALUATION' | 'RESULTATS' | 'PREMIERE_VISITE';
  statut: 'CONFIRME' | 'EN_ATTENTE' | 'ANNULE' | 'LIBRE';
  dateHeure: string;
  dureeMinutes: number;
  notes?: string;
  googleEventId?: string;
}

@Injectable({ providedIn: 'root' })
export class RendezVousService {

  private readonly BASE = 'http://localhost:8080/api/rendezvous';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RendezVousDTO[]> {
    return this.http.get<RendezVousDTO[]>(this.BASE);
  }

  getBySemaine(date: string): Observable<RendezVousDTO[]> {
    return this.http.get<RendezVousDTO[]>(`${this.BASE}/semaine/${date}`);
  }

  getByJour(date: string): Observable<RendezVousDTO[]> {
    return this.http.get<RendezVousDTO[]>(`${this.BASE}/jour/${date}`);
  }

  create(rdv: RendezVousDTO): Observable<RendezVousDTO> {
    return this.http.post<RendezVousDTO>(this.BASE, rdv);
  }

  update(id: number, rdv: RendezVousDTO): Observable<RendezVousDTO> {
    return this.http.put<RendezVousDTO>(`${this.BASE}/${id}`, rdv);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
