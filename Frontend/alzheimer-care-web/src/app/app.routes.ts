import { Routes } from '@angular/router';
// Make sure these paths match your file structure exactly
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout';
import { VerifyComponent } from './features/auth/pages/verify/verify'; // <--- ADD THIS IMPORT
import { AdminLayoutComponent } from './features/admin/layouts/admin-layout/admin-layout';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  {
    path: 'verify',
    component: VerifyComponent,
  },
  {
    path: 'interface',
    loadComponent: () =>
      import('./features/interface/patient-interface/patient-interface').then(
        (m) => m.PatientInterfaceComponent,
      ),
  },
  // 1. Route for Auth (Login)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    // Lazy load the Auth Module
    loadChildren: () => import('./features/auth/auth-module').then((m) => m.AuthModule),
  },
  // 2. Route for Admin Section{{}}
  {
    path: 'admin',
    component: AdminLayoutComponent, // Uses the Admin specific sidebar
    // canActivate: [adminGuard],    // <--- Uncomment when ready
    children: [
      { 
  path: 'alerts', 
  loadComponent: () => import('./features/admin/alerts-admin/alerts-admin').then(m => m.AlertAdminListComponent) 
},
{ 
  path: 'alerts/add', 
  loadComponent: () => import('./features/admin/alerts-admin/alert-add/alert-add').then(m => m.AlertAddComponent) 
},
{ 
  path: 'alerts/edit/:id', 
  loadComponent: () => import('./features/admin/alerts-admin/alert-add/alert-add').then(m => m.AlertAddComponent) 
},
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'users/edit/:id',
        loadComponent: () =>
          import('./features/admin/users/user-add/user-add').then(
            (m) => m.UserAddComponent,
          ),
      },
      {
        path: 'users/add',
        loadComponent: () =>
          import('./features/admin/users/user-add/user-add').then((m) => m.UserAddComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users').then((m) => m.UsersComponent),
      },
      {
        path: 'cognitive/add',
        loadComponent: () =>
          import('./features/admin/assessments/cognitive-add/cognitive-add').then((m) => m.CognitiveAddComponent),
      },
      {
        path: 'cognitive/edit/:id',
        loadComponent: () =>
          import('./features/admin/assessments/cognitive-add/cognitive-add').then(
            (m) => m.CognitiveAddComponent,
          ),
      },
      {
        path: 'cognitive',
        loadComponent: () => import('./features/admin/assessments/cognitive-list/cognitive-list').then((m) => m.CognitiveAdminListComponent),
      },
      {
        path: 'autonomy/add',
        loadComponent: () =>
          import('./features/admin/assessments/autonomy-add/autonomy-add').then((m) => m.AutonomyAddComponent),
      },
      {
        path: 'autonomy/edit/:id',
        loadComponent: () =>
          import('./features/admin/assessments/autonomy-add/autonomy-add').then(
            (m) => m.AutonomyAddComponent,
          ),
      },
      {
        // Must include :patientId because your component checks route.snapshot.paramMap.get('patientId')
        path: 'autonomy/dashboard/:patientId', 
        loadComponent: () => 
          // ⚠️ UPDATE THE PATH BELOW to match the actual location of your AutonomyDashboardComponent file
          import('./features/admin/assessments/autonomy-dashboard/autonomy-dashboard').then((m) => m.AutonomyDashboardComponent),
      },
      {
        // Must include :patientId because your component checks route.snapshot.paramMap.get('patientId')
        path: 'cognitive/dashboard/:patientId', 
        loadComponent: () => 
          // ⚠️ UPDATE THE PATH BELOW to match the actual location of your CognitiveDashboardComponent file
          import('./features/admin/assessments/cognitive-dashboard/cognitive-dashboard').then((m) => m.CognitiveAssessmentsComponent),
      },
      {
        path: 'cognitive/pdf/:patientId',
        loadComponent: () =>
          import('./features/admin/assessments/cognitive-pdf/cognitive-pdf').then((m) => m.CognitivePdfComponent),
      },
      {
        path: 'autonomy',
        loadComponent: () => import('./features/admin/assessments/autonomy-list/autonomy-list').then((m) => m.AutonomyAdminListComponent),
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/admin/appointments/appointments-calendar.component').then((m) => m.AppointmentsCalendarComponent),
      },
            {
        path: 'appointments/new',
        loadComponent: () => import('./features/admin/appointments/rendezvous-form.component').then((m) => m.RendezVousFormComponent),
      },
      {
        path: 'appointments/edit/:id',
        loadComponent: () => import('./features/admin/appointments/rendezvous-form.component').then((m) => m.RendezVousFormComponent),
      },

      // --- ADD THIS REDIRECT ---
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
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
        loadComponent: () =>
          import('./features/dashboard/pages/caregiver-dashboard/caregiver-dashboard').then(
            (m) => m.CaregiverDashboardComponent,
          ),
      },
      {
        path: 'patients',
        // --- UPDATED THIS SECTION ---
        // Lazy loading the new CaregiverDashboardComponent directly
        loadComponent: () =>
          import('./features/patients/patient-list/patient-list').then((m) => m.PatientList),
      },
      {
        path: 'assesements',
        // --- UPDATED THIS SECTION ---
        // Lazy loading the new CaregiverDashboardComponent directly
        loadComponent: () =>
          import('./features/assesements/patient-assessments').then((m) => m.PatientAssessmentsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile-container/profile-container').then(
            (m) => m.ProfileContainerComponent,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/communication/pages/messages/messages').then(
            (m) => m.MessagesComponent,
          ),
      },
      {
        path: 'alerts/:id',
        loadComponent: () =>
          import('./features/alerts/pages/alert-detail/alert-detail').then(
            (m) => m.AlertDetailComponent,
          ),
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./features/alerts/pages/alert-list/alert-list').then((m) => m.AlertListComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // 3. Default Redirects
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }, // 404 - Page not found
];
