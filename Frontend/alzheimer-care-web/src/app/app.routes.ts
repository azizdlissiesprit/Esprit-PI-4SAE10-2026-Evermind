import { Routes } from '@angular/router';
// Make sure these paths match your file structure exactly
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout';
import { VerifyComponent } from './features/auth/pages/verify/verify'; // <--- ADD THIS IMPORT

export const routes: Routes = [

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
    children: [
      {
        path: 'dashboard',
        // --- UPDATED THIS SECTION ---
        // Lazy loading the new CaregiverDashboardComponent directly
        loadComponent: () => import('./features/dashboard/pages/caregiver-dashboard/caregiver-dashboard')
          .then(m => m.CaregiverDashboardComponent)
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // 3. Default Redirects
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' } // 404 - Page not found
];