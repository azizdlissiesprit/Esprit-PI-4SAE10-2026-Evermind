import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard, roleHomeRedirectGuard } from './core/guards/role.guard';
import { RegistrationSuccessComponent } from './features/auth/pages/registration-success/registration-success';
import { ResetPasswordComponent } from './features/auth/pages/reset-password';

export const routes: Routes = [
  { path: 'registration-success', component: RegistrationSuccessComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth-module').then((m) => m.AuthModule)
      }
    ]
  },
  {
    path: 'app/backoffice',
    loadComponent: () =>
      import('./features/backoffice/layout/backoffice-layout').then(
        (m) => m.BackofficeLayoutComponent
      ),
    canActivate: [roleGuard(['ADMIN'])],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/backoffice/pages/users/users-page').then((m) => m.UsersPageComponent)
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/backoffice/pages/patients/patients-page').then(
            (m) => m.PatientsPageComponent
          )
      },
      {
        path: 'reclamations',
        loadComponent: () =>
          import('./features/reclamation/pages/admin-reclamations/admin-reclamations.component').then(
            (m) => m.AdminReclamationsComponent
          )
      },
      {
        path: 'reclamations/:id',
        loadComponent: () =>
          import('./features/reclamation/pages/admin-reclamation-detail/admin-reclamation-detail.component').then(
            (m) => m.AdminReclamationDetailComponent
          )
      }
    ]
  },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [roleHomeRedirectGuard],
        children: []
      },
      {
        path: 'aidant',
        canActivate: [roleGuard(['AIDANT'])],
        children: [
          {
            path: 'profile',
            loadComponent: () =>
              import('./features/profile/profile-container/profile-container').then(
                (m) => m.ProfileContainerComponent
              )
          },
          {
            path: 'reclamations',
            loadChildren: () =>
              import('./features/reclamation/reclamation.routes').then((m) => m.RECLAMATION_ROUTES)
          },
          { path: '', pathMatch: 'full', redirectTo: 'profile' }
        ]
      },
      {
        path: 'medecin',
        canActivate: [roleGuard(['MEDECIN'])],
        children: [
          {
            path: 'profile',
            loadComponent: () =>
              import('./features/profile/profile-container/profile-container').then(
                (m) => m.ProfileContainerComponent
              )
          },
          {
            path: 'reclamations',
            loadChildren: () =>
              import('./features/reclamation/reclamation.routes').then((m) => m.RECLAMATION_ROUTES)
          },
          { path: '', pathMatch: 'full', redirectTo: 'profile' }
        ]
      },
      {
        path: 'responsable',
        canActivate: [roleGuard(['RESPONSABLE'])],
        children: [
          {
            path: 'profile',
            loadComponent: () =>
              import('./features/profile/profile-container/profile-container').then(
                (m) => m.ProfileContainerComponent
              )
          },
          {
            path: 'reclamations',
            loadChildren: () =>
              import('./features/reclamation/reclamation.routes').then((m) => m.RECLAMATION_ROUTES)
          },
          { path: '', pathMatch: 'full', redirectTo: 'profile' }
        ]
      },
      { path: '**', canActivate: [roleHomeRedirectGuard], children: [] }
    ]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
