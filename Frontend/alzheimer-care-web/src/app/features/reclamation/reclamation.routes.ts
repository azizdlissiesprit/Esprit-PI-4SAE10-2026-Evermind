import { Routes } from '@angular/router';

export const RECLAMATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-reclamations/user-reclamations.component').then(
        (m) => m.UserReclamationsComponent
      )
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/user-create-reclamation/user-create-reclamation.component').then(
        (m) => m.UserCreateReclamationComponent
      )
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/user-reclamation-detail/user-reclamation-detail.component').then(
        (m) => m.UserReclamationDetailComponent
      )
  },
  {
    path: 'create',
    redirectTo: '',
    pathMatch: 'full'
  }
];
