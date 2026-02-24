import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import {
  Patient,
  AutonomyAssessment,
  AutonomyChartPoint,
  AutonomyScores,
  AutonomyAssessmentApiResponse
} from '../models/autonomy.model';
import { AUTONOMY_ASSESSMENT_API_BASE } from '../core/api.config';

const DEFAULT_SCORES: AutonomyScores = {
  hygiene: 0,
  feeding: 0,
  dressing: 0,
  mobility: 0,
  communication: 0
};

function parseJsonArray(str: string | null): string[] {
  if (str == null || str === '') return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapApiToAssessment(api: AutonomyAssessmentApiResponse): AutonomyAssessment {
  const scores = api.scores ?? DEFAULT_SCORES;
  return {
    id: String(api.id),
    patientId: api.patientId,
    date: api.date,
    evaluator: api.evaluator,
    scores,
    totalScore: api.totalScore,
    trend: api.trend,
    trendPoints: api.trendPoints ?? undefined,
    assistanceLevel: api.assistanceLevel ?? '',
    observations: api.observations ?? undefined,
    recommendedDevices: parseJsonArray(api.recommendedDevicesJson),
    caregiverRecommendations: parseJsonArray(api.caregiverRecommendationsJson)
  };
}

@Injectable({ providedIn: 'root' })
export class AutonomyService {
  constructor(private http: HttpClient) {}

  getPatient(patientId: string): Observable<Patient> {
    return of({
      id: patientId,
      name: `Patient #${patientId}`,
      birthDate: '—',
      age: 0,
      secuNumber: '—',
      avatar: '',
      status: 'active',
      alzheimerStage: '—',
      riskLevel: 'medium',
      lastUpdate: '—'
    } as Patient);
  }

  /** Tous les assessments (pour la liste). Les erreurs remontent pour affichage. */
  getAllAssessments(): Observable<AutonomyAssessment[]> {
    return this.http
      .get<AutonomyAssessmentApiResponse[]>(AUTONOMY_ASSESSMENT_API_BASE)
      .pipe(map(list => (list ?? []).map(mapApiToAssessment)));
  }

  getAssessments(patientId: string): Observable<AutonomyAssessment[]> {
    return this.http
      .get<AutonomyAssessmentApiResponse[]>(`${AUTONOMY_ASSESSMENT_API_BASE}/patient/${encodeURIComponent(patientId)}`)
      .pipe(
        map(list => (list ?? []).map(mapApiToAssessment)),
        catchError(() => of([]))
      );
  }

  getAssessment(assessmentId: string): Observable<AutonomyAssessment | undefined> {
    const id = Number(assessmentId);
    if (Number.isNaN(id)) return of(undefined);
    return this.http
      .get<AutonomyAssessmentApiResponse>(`${AUTONOMY_ASSESSMENT_API_BASE}/${id}`)
      .pipe(
        map(mapApiToAssessment),
        catchError(() => of(undefined))
      );
  }

  getChartData(patientId: string): Observable<AutonomyChartPoint[]> {
    return this.getAssessments(patientId).pipe(
      map(assessments =>
        assessments
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(a => ({ date: a.date, totalScore: a.totalScore }))
      )
    );
  }

  createAssessment(data: Omit<AutonomyAssessment, 'id'>): Observable<AutonomyAssessment | null> {
    const totalScore =
      data.scores.hygiene + data.scores.feeding + data.scores.dressing +
      data.scores.mobility + data.scores.communication;
    const body = {
      patientId: data.patientId,
      date: data.date,
      evaluator: data.evaluator,
      scores: data.scores,
      totalScore,
      trend: data.trend,
      trendPoints: data.trendPoints ?? null,
      assistanceLevel: data.assistanceLevel,
      observations: data.observations ?? null,
      recommendedDevicesJson: data.recommendedDevices?.length
        ? JSON.stringify(data.recommendedDevices)
        : null,
      caregiverRecommendationsJson: data.caregiverRecommendations?.length
        ? JSON.stringify(data.caregiverRecommendations)
        : null
    };
    return this.http
      .post<AutonomyAssessmentApiResponse>(AUTONOMY_ASSESSMENT_API_BASE, body)
      .pipe(
        map(mapApiToAssessment),
        catchError(() => of(null))
      );
  }

  updateAssessment(assessment: AutonomyAssessment): Observable<AutonomyAssessment | null> {
    const id = Number(assessment.id);
    if (Number.isNaN(id)) return of(null);
    const body = {
      id,
      patientId: assessment.patientId,
      date: assessment.date,
      evaluator: assessment.evaluator,
      scores: assessment.scores,
      totalScore: assessment.totalScore,
      trend: assessment.trend,
      trendPoints: assessment.trendPoints ?? null,
      assistanceLevel: assessment.assistanceLevel,
      observations: assessment.observations ?? null,
      recommendedDevicesJson: assessment.recommendedDevices?.length
        ? JSON.stringify(assessment.recommendedDevices)
        : null,
      caregiverRecommendationsJson: assessment.caregiverRecommendations?.length
        ? JSON.stringify(assessment.caregiverRecommendations)
        : null
    };
    return this.http
      .put<AutonomyAssessmentApiResponse>(`${AUTONOMY_ASSESSMENT_API_BASE}/${id}`, body)
      .pipe(
        map(mapApiToAssessment),
        catchError(() => of(null))
      );
  }

  deleteAssessment(assessmentId: string): Observable<boolean> {
    const id = Number(assessmentId);
    if (Number.isNaN(id)) return of(false);
    return this.http
      .delete<void>(`${AUTONOMY_ASSESSMENT_API_BASE}/${id}`, { observe: 'response' })
      .pipe(
        map(res => res.status === 204),
        catchError(() => of(false))
      );
  }
}
