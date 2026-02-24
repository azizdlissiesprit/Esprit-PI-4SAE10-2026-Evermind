import { RenderMode, ServerRoute } from '@angular/ssr';

const paramPatient = () => Promise.resolve([{ patientId: 'P-2024-8921' }]);
const paramPatientAndAssessment = () => Promise.resolve([{ patientId: 'P-2024-8921', assessmentId: '1' }]);
const paramAlertId = () => Promise.resolve([{ id: '1' }]);

export const serverRoutes: ServerRoute[] = [
  { path: 'app/alerts/:id', renderMode: RenderMode.Prerender, getPrerenderParams: paramAlertId },
  { path: 'app/patients/:patientId/autonomy', renderMode: RenderMode.Prerender, getPrerenderParams: paramPatient },
  { path: 'app/patients/:patientId/autonomy/new', renderMode: RenderMode.Prerender, getPrerenderParams: paramPatient },
  { path: 'app/patients/:patientId/autonomy/:assessmentId/edit', renderMode: RenderMode.Prerender, getPrerenderParams: paramPatientAndAssessment },
  { path: 'app/patients/:patientId/cognitive-assessments', renderMode: RenderMode.Prerender, getPrerenderParams: paramPatient },
  { path: 'app/patients/:patientId/cognitive-assessments/new', renderMode: RenderMode.Prerender, getPrerenderParams: paramPatient },
  { path: 'app/patients/:patientId/cognitive-assessments/:assessmentId', renderMode: RenderMode.Prerender, getPrerenderParams: paramPatientAndAssessment },
  { path: 'app/patients/:patientId/cognitive-assessments/:assessmentId/edit', renderMode: RenderMode.Prerender, getPrerenderParams: paramPatientAndAssessment },
  { path: '**', renderMode: RenderMode.Prerender }
];
