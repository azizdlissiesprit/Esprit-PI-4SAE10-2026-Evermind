import { Routes } from '@angular/router';
// Make sure these paths match your file structure exactly
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout';
import { VerifyComponent } from './features/auth/pages/verify/verify'; // <--- ADD THIS IMPORT
import { AuthGuard } from './core/services/auth.guard'; // <--- ADD THIS IMPORT
import { NotFoundComponent } from './core/components/error-pages/not-found/not-found';
import { ForbiddenComponent } from './core/components/error-pages/forbidden/forbidden';

export const routes: Routes = [

  {
    path: 'verify-certificate/:code',
    loadComponent: () => import('./features/formation/pages/verify-certificate/verify-certificate').then(m => m.VerifyCertificateComponent)
  },
  {
    path: 'verify-certificate',
    loadComponent: () => import('./features/formation/pages/verify-certificate/verify-certificate').then(m => m.VerifyCertificateComponent)
  },
  {
    path: 'verify',
    component: VerifyComponent
  },
  // 1. Route for Auth (Login)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    // Lazy load the Auth Module
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },

  // 2. Route for the Main App (Dashboard, Patients, etc.)
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        // --- UPDATED THIS SECTION ---
        // Lazy loading the new CaregiverDashboardComponent directly
        loadComponent: () => import('./features/dashboard/pages/caregiver-dashboard/caregiver-dashboard')
          .then(m => m.CaregiverDashboardComponent)
      },
      {
        path: 'admin/stats',
        loadComponent: () => import('./features/dashboard/components/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'patients',
        // --- UPDATED THIS SECTION ---
        // Lazy loading the new CaregiverDashboardComponent directly
        loadComponent: () => import('./features/patients/patient-list/patient-list')
          .then(m => m.PatientList)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile-container/profile-container')
          .then(m => m.ProfileContainerComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/communication/pages/messages/messages').then(m => m.MessagesComponent)
      },
      {
        path: 'alerts/:id',
        loadComponent: () => import('./features/alerts/pages/alert-detail/alert-detail').then(m => m.AlertDetailComponent)
      },
      {
        path: 'alerts',
        loadComponent: () => import('./features/alerts/pages/alert-list/alert-list').then(m => m.AlertListComponent)
      },
      {
        path: 'formation',
        loadComponent: () => import('./features/formation/formation-container/formation-container').then(m => m.FormationContainerComponent),
        children: [
          { path: '', redirectTo: 'programmes', pathMatch: 'full' },
          { path: 'programmes', loadComponent: () => import('./features/formation/pages/programme-list/programme-list').then(m => m.ProgrammeListComponent) },
          { path: 'modules', loadComponent: () => import('./features/formation/pages/module-list/module-list').then(m => m.ModuleListComponent) },
          { path: 'ressources', loadComponent: () => import('./features/formation/pages/ressource-list/ressource-list').then(m => m.RessourceListComponent) },
          { path: 'quiz', loadComponent: () => import('./features/formation/pages/quiz-list/quiz-list').then(m => m.QuizListComponent) },
          { path: 'quiz/builder/:quizId', loadComponent: () => import('./features/formation/pages/quiz-builder/quiz-builder').then(m => m.QuizBuilderComponent) }
        ]
      },
      {
        path: 'user-interface',
        loadComponent: () => import('./features/formation/pages/learn-catalog/learn-catalog').then(m => m.LearnCatalogComponent)
      },
      {
        path: 'user-interface/programme/:id',
        loadComponent: () => import('./features/formation/pages/programme-learner/programme-learner').then(m => m.ProgrammeLearnerComponent)
      },
      {
        path: 'user-interface/programme/:programmeId/module/:moduleId',
        loadComponent: () => import('./features/formation/pages/module-viewer/module-viewer').then(m => m.ModuleViewerComponent)
      },
      {
        path: 'user-interface/quiz/:moduleId',
        loadComponent: () => import('./features/formation/pages/quiz-learner/quiz-learner').then(m => m.QuizLearnerComponent)
      },
      {
        path: 'user-interface/certificat',
        loadComponent: () => import('./features/formation/pages/certificat-view/certificat-view').then(m => m.CertificatViewComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 3. Error Pages
  { path: 'error/404', component: NotFoundComponent },
  { path: 'error/403', component: ForbiddenComponent },

  // 4. Default Redirects
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent } // 404 - Page not found
];