import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FORMATION_API_BASE } from '../../../core/config/api.config';

const BASE = FORMATION_API_BASE;

export interface ProgrammeFormation {
  id?: number;
  titre: string;
  description?: string;
  theme: string;
  dateCreation?: string;
}

export interface Module {
  id?: number;
  titre: string;
  type: string;
  contenu?: string;
  dureeEstimee?: number;
  programmeFormation?: ProgrammeFormation;
}

export interface Ressource {
  id?: number;
  url: string;
  typeFichier?: string;
  taille?: number;
  module?: Module;
}

export interface Quiz {
  id?: number;
  titre: string;
  seuilReussite?: number;
  module?: Module;
  questionCount?: number;
  // DTO fields for module info
  moduleId?: number;
  moduleTitre?: string;
  moduleType?: string;
  moduledureeEstimee?: number;
}

export type QuestionType = 'QCU' | 'QCM' | 'TRUE_FALSE';

export interface Question {
  id?: number;
  questionText: string;
  type: QuestionType;
  options: string;       // JSON string, e.g. '["A","B","C"]'
  correctAnswers?: string; // JSON string, e.g. '[1]' — not present for student endpoint
  orderIndex?: number;
}

export interface QuizTentativeResult {
  id: number;
  score: number;
  total: number;
  passed: boolean;
  submittedAt: string;
  certificateCode?: string;
}

export interface QuizTentative {
  id?: number;
  userId: number;
  answers: string;
  score: number;
  total: number;
  passed: boolean;
  submittedAt: string;
}

export interface CertificateResponse {
  id: number;
  certificateCode: string;
  userId: number;
  quizTitle: string;
  moduleTitle: string;
  programmeTitle?: string;
  score: number;
  total: number;
  percentage: number;
  issuedAt: string;
  status: 'ISSUED' | 'REVOKED';
  digitalSignature: string;
  tentativeId: number;
}

export interface VerifyCertificateResponse {
  valid: boolean;
  status: string;
  signatureMatch: boolean;
  certificateCode?: string;
  userId?: number;
  quizTitle?: string;
  moduleTitle?: string;
  programmeTitle?: string;
  score?: number;
  total?: number;
  percentage?: number;
  issuedAt?: string;
  digitalSignature?: string;
}

@Injectable({ providedIn: 'root' })
export class FormationService {
  constructor(private http: HttpClient) { }

  // Programmes
  getProgrammes(): Observable<ProgrammeFormation[]> {
    return this.http.get<ProgrammeFormation[]>(`${BASE}/programmes`);
  }
  getProgramme(id: number): Observable<ProgrammeFormation> {
    return this.http.get<ProgrammeFormation>(`${BASE}/programmes/${id}`);
  }
  createProgramme(p: ProgrammeFormation): Observable<ProgrammeFormation> {
    return this.http.post<ProgrammeFormation>(`${BASE}/programmes`, p);
  }
  updateProgramme(id: number, p: ProgrammeFormation): Observable<ProgrammeFormation> {
    return this.http.put<ProgrammeFormation>(`${BASE}/programmes/${id}`, p);
  }
  deleteProgramme(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/programmes/${id}`);
  }

  // Modules
  getModules(): Observable<Module[]> {
    return this.http.get<Module[]>(`${BASE}/modules`);
  }
  getModulesByProgramme(programmeId: number): Observable<Module[]> {
    return this.http.get<Module[]>(`${BASE}/modules/programme/${programmeId}`);
  }
  getModule(id: number): Observable<Module> {
    return this.http.get<Module>(`${BASE}/modules/${id}`);
  }
  createModule(data: { programmeId: number; titre: string; type: string; contenu?: string; dureeEstimee?: number }): Observable<Module> {
    return this.http.post<Module>(`${BASE}/modules`, data);
  }
  updateModule(id: number, m: Partial<Module>): Observable<Module> {
    return this.http.put<Module>(`${BASE}/modules/${id}`, m);
  }
  deleteModule(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/modules/${id}`);
  }

  // Ressources
  getRessources(): Observable<Ressource[]> {
    return this.http.get<Ressource[]>(`${BASE}/ressources`);
  }
  getRessourcesByModule(moduleId: number): Observable<Ressource[]> {
    return this.http.get<Ressource[]>(`${BASE}/ressources/module/${moduleId}`);
  }
  getRessource(id: number): Observable<Ressource> {
    return this.http.get<Ressource>(`${BASE}/ressources/${id}`);
  }
  createRessource(data: { moduleId: number; url: string; typeFichier?: string; taille?: number }): Observable<Ressource> {
    return this.http.post<Ressource>(`${BASE}/ressources`, data);
  }
  updateRessource(id: number, r: Partial<Ressource>): Observable<Ressource> {
    return this.http.put<Ressource>(`${BASE}/ressources/${id}`, r);
  }
  deleteRessource(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/ressources/${id}`);
  }

  // Quiz
  getQuizList(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${BASE}/quiz`);
  }
  getQuiz(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${BASE}/quiz/${id}`);
  }
  getQuizzesByModuleId(moduleId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${BASE}/quiz/module/${moduleId}`);
  }
  createQuiz(data: { moduleId: number; titre: string; seuilReussite?: number }): Observable<Quiz> {
    return this.http.post<Quiz>(`${BASE}/quiz`, data);
  }
  updateQuiz(id: number, q: Partial<Quiz>): Observable<Quiz> {
    return this.http.put<Quiz>(`${BASE}/quiz/${id}`, q);
  }
  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/quiz/${id}`);
  }

  // Questions
  getQuestions(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${BASE}/quiz/${quizId}/questions`);
  }
  getStudentQuestions(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${BASE}/quiz/${quizId}/questions/student`);
  }
  addQuestion(quizId: number, q: { questionText: string; type: QuestionType; options: string; correctAnswers: string; orderIndex?: number }): Observable<Question> {
    return this.http.post<Question>(`${BASE}/quiz/${quizId}/questions`, q);
  }
  updateQuestion(id: number, q: Partial<Question>): Observable<Question> {
    return this.http.put<Question>(`${BASE}/questions/${id}`, q);
  }
  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/questions/${id}`);
  }
  generateQuestions(quizId: number, params: {
    topic: string;
    numberOfQuestions: number;
    questionTypes: string[];
  }): Observable<Question[]> {
    return this.http.post<Question[]>(
      `${BASE}/quiz/${quizId}/questions/generate`, params
    );
  }

  // Quiz Tentatives
  submitQuizTentative(data: { quizId: number; userId: number; answers: Record<string, number[]> }): Observable<QuizTentativeResult> {
    return this.http.post<QuizTentativeResult>(`${BASE}/quiz-tentative/submit`, data);
  }
  getTentativesByQuiz(quizId: number): Observable<QuizTentative[]> {
    return this.http.get<QuizTentative[]>(`${BASE}/quiz-tentative/quiz/${quizId}`);
  }
  getTentativesByUser(userId: number): Observable<QuizTentative[]> {
    return this.http.get<QuizTentative[]>(`${BASE}/quiz-tentative/user/${userId}`);
  }

  // Certificates
  getCertificate(code: string): Observable<CertificateResponse> {
    return this.http.get<CertificateResponse>(`${BASE}/certificates/${code}`);
  }
  verifyCertificate(code: string): Observable<VerifyCertificateResponse> {
    return this.http.get<VerifyCertificateResponse>(`${BASE}/certificates/verify/${code}`);
  }
  getUserCertificates(userId: number): Observable<CertificateResponse[]> {
    return this.http.get<CertificateResponse[]>(`${BASE}/certificates/user/${userId}`);
  }
  revokeCertificate(code: string): Observable<CertificateResponse> {
    return this.http.post<CertificateResponse>(`${BASE}/certificates/${code}/revoke`, {});
  }
}

