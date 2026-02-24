import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { Assessment, Patient, ChartDataPoint, DomainScore, AssessmentApiResponse } from '../models/assessment.model';
import { COGNITIVE_ASSESSMENT_API_BASE } from '../core/api.config';

/** Default patient when backend does not expose a Patient API (dashboard header). */
const DEFAULT_PATIENT: Patient = {
  id: 'P-2024-8921',
  name: 'Patient',
  birthDate: '—',
  age: 0,
  secuNumber: '—',
  avatar: 'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F65-80%2FEuropean%2F2',
  status: 'active',
  alzheimerStage: '—',
  riskLevel: 'medium',
  lastUpdate: '—'
};

function mapApiToAssessment(api: AssessmentApiResponse): Assessment {
  const scores = api.scores ?? {
    memory: 0,
    orientation: 0,
    language: 0,
    executiveFunctions: 0
  };
  return {
    id: String(api.id),
    date: api.date,
    type: api.type,
    evaluator: api.evaluator,
    mmseScore: api.mmseScore,
    moocaScore: api.moocaScore,
    trend: api.trend,
    trendPoints: api.trendPoints ?? undefined,
    scores,
    observations: api.observations ?? '',
    patientId: api.patientId
  };
}

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  constructor(private http: HttpClient) {}

  /** Patient info: not provided by this API; returns a default for UI. Replace when a Patient API exists. */
  getPatient(patientId: string): Observable<Patient> {
    return of({ ...DEFAULT_PATIENT, id: patientId, name: `Patient #${patientId}` });
  }

  /** All assessments (for list and analytics). Errors propagate so the UI can show a message. */
  getAllAssessments(): Observable<Assessment[]> {
    return this.http
      .get<AssessmentApiResponse[]>(COGNITIVE_ASSESSMENT_API_BASE)
      .pipe(map(list => (list ?? []).map(mapApiToAssessment)));
  }

  getAssessments(patientId: string): Observable<Assessment[]> {
    return this.http
      .get<AssessmentApiResponse[]>(`${COGNITIVE_ASSESSMENT_API_BASE}/patient/${encodeURIComponent(patientId)}`)
      .pipe(
        map(list => (list ?? []).map(mapApiToAssessment)),
        catchError(() => of([]))
      );
  }

  getAssessment(assessmentId: string): Observable<Assessment | undefined> {
    const id = Number(assessmentId);
    if (Number.isNaN(id)) return of(undefined);
    return this.http
      .get<AssessmentApiResponse>(`${COGNITIVE_ASSESSMENT_API_BASE}/${id}`)
      .pipe(
        map(mapApiToAssessment),
        catchError(() => of(undefined))
      );
  }

  getChartData(patientId: string): Observable<ChartDataPoint[]> {
    return this.getAssessments(patientId).pipe(
      map(assessments =>
        assessments
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(a => ({ date: a.date, mmse: a.mmseScore, mooca: a.moocaScore }))
      )
    );
  }

  getDomainScores(assessmentId: string): Observable<DomainScore[]> {
    return this.getAssessment(assessmentId).pipe(
      map(assessment => {
        if (!assessment) return [];
        const { scores } = assessment;
        const toDomain = (
          name: string,
          score: number,
          color: string
        ): DomainScore => ({
          name,
          score,
          maxScore: 10,
          percentage: Math.min(100, (score / 10) * 100),
          color
        });
        const color = (s: number) =>
          s <= 3 ? '#ef4444' : s <= 6 ? '#f59e0b' : '#22c55e';
        return [
          toDomain('Memory', scores.memory, color(scores.memory)),
          toDomain('Spatial-temporal orientation', scores.orientation, color(scores.orientation)),
          toDomain('Language', scores.language, color(scores.language)),
          toDomain('Executive functions', scores.executiveFunctions, color(scores.executiveFunctions))
        ];
      })
    );
  }

  createAssessment(assessment: Omit<Assessment, 'id'>): Observable<Assessment | null> {
    const body = {
      patientId: assessment.patientId,
      date: assessment.date,
      type: assessment.type,
      evaluator: assessment.evaluator,
      mmseScore: assessment.mmseScore,
      moocaScore: assessment.moocaScore,
      trend: assessment.trend,
      trendPoints: assessment.trendPoints ?? null,
      scores: assessment.scores,
      observations: assessment.observations
    };
    return this.http
      .post<AssessmentApiResponse>(COGNITIVE_ASSESSMENT_API_BASE, body)
      .pipe(
        map(mapApiToAssessment),
        catchError(() => of(null))
      );
  }

  updateAssessment(assessment: Assessment): Observable<Assessment | null> {
    const id = Number(assessment.id);
    if (Number.isNaN(id)) return of(null);
    const body = {
      id,
      patientId: assessment.patientId,
      date: assessment.date,
      type: assessment.type,
      evaluator: assessment.evaluator,
      mmseScore: assessment.mmseScore,
      moocaScore: assessment.moocaScore,
      trend: assessment.trend,
      trendPoints: assessment.trendPoints ?? null,
      scores: assessment.scores,
      observations: assessment.observations
    };
    return this.http
      .put<AssessmentApiResponse>(`${COGNITIVE_ASSESSMENT_API_BASE}/${id}`, body)
      .pipe(
        map(mapApiToAssessment),
        catchError(() => of(null))
      );
  }

  deleteAssessment(assessmentId: string): Observable<boolean> {
    const id = Number(assessmentId);
    if (Number.isNaN(id)) return of(false);
    return this.http
      .delete<void>(`${COGNITIVE_ASSESSMENT_API_BASE}/${id}`, { observe: 'response' })
      .pipe(
        map(res => res.status === 204),
        catchError(() => of(false))
      );
  }
}
