import { Routes } from '@angular/router';
// Make sure these paths match your file structure exactly
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout';

export const routes: Routes = [
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
        // Lazy load the Dashboard Module (You need to create this module first if you haven't!)
        loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DashboardModule)
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