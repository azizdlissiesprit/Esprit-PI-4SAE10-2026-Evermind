import { Routes } from '@angular/router';
// Make sure these paths match your file structure exactly
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout';
import { VerifyComponent } from './features/auth/pages/verify/verify'; // <--- ADD THIS IMPORT
import { AdminLayoutComponent } from './features/admin/layouts/admin-layout/admin-layout';
import { adminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'verify',
    component: VerifyComponent,
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
    canActivate: [adminGuard],    // <--- Uncomment when ready
    children: [
      { 
  path: 'alerts', 
  loadComponent: () => import('./features/admin/alerts-admin/alerts-admin').then(m => m.AlertAdminListComponent) 
},
{ 
  path: 'assign-patients', 
  loadComponent: () => import('./features/admin/patients/assign-patients/assign-patients').then(m => m.AssignPatientsComponent) 
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
  path: 'data-seeding',
  title: 'Data Seeding Console',
  loadComponent: () => import('./features/admin/data-seeding/data-seeding').then((m) => m.DataSeedingComponent)
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
        path: 'autonomy',
        loadComponent: () => import('./features/admin/assessments/autonomy-list/autonomy-list').then((m) => m.AutonomyAdminListComponent),
      },
      // --- STOCK MANAGEMENT BACK OFFICE ---
      {
        path: 'stock/dashboard',
        loadComponent: () => import('./features/admin/stock-admin/tableau-de-bord/tableau-de-bord.component').then(m => m.TableauDeBordComponent)
      },
      {
        path: 'stock/categories',
        loadComponent: () => import('./features/admin/stock-admin/categorie/liste-categories/liste-categories.component').then(m => m.ListeCategoriesComponent)
      },
      {
        path: 'stock/categories/ajouter',
        loadComponent: () => import('./features/admin/stock-admin/categorie/formulaire-categorie/formulaire-categorie.component').then(m => m.FormulaireCategorieComponent)
      },
      {
        path: 'stock/categories/modifier/:id',
        loadComponent: () => import('./features/admin/stock-admin/categorie/formulaire-categorie/formulaire-categorie.component').then(m => m.FormulaireCategorieComponent)
      },
      {
        path: 'stock/produits',
        loadComponent: () => import('./features/admin/stock-admin/produit/liste-produits/liste-produits.component').then(m => m.ListeProduitsComponent)
      },
      {
        path: 'stock/produits/ajouter',
        loadComponent: () => import('./features/admin/stock-admin/produit/formulaire-produit/formulaire-produit.component').then(m => m.FormulaireProduitComponent)
      },
      {
        path: 'stock/produits/modifier/:id',
        loadComponent: () => import('./features/admin/stock-admin/produit/formulaire-produit/formulaire-produit.component').then(m => m.FormulaireProduitComponent)
      },
      {
        path: 'stock/commandes',
        loadComponent: () => import('./features/admin/stock-admin/commande/liste-commandes/liste-commandes.component').then(m => m.ListeCommandesComponent)
      },
      {
        path: 'stock/commandes/:id',
        loadComponent: () => import('./features/admin/stock-admin/commande/detail-commande/detail-commande.component').then(m => m.DetailCommandeComponent)
      },
      {
        path: 'stock/analyse',
        loadComponent: () => import('./features/admin/stock-admin/analyse-stock/analyse-stock.component').then(m => m.AnalyseStockComponent)
      },
      {
        path: 'stock/emails',
        loadComponent: () => import('./features/admin/stock-admin/email-logs/email-log-list.component').then(m => m.EmailLogListComponent)
      },
      {
        path: 'stock/analytics',
        loadComponent: () => import('./features/stock-front/analytics/analytics').then(m => m.AnalyticsComponent)
      },

      // --- ADD THIS REDIRECT ---
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  // 2. Route for the Main App (Dashboard, Patients, etc.)
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Tableau de Bord',
        // --- UPDATED THIS SECTION ---
        // Lazy loading the new CaregiverDashboardComponent directly
        loadComponent: () =>
          import('./features/dashboard/pages/caregiver-dashboard/caregiver-dashboard').then(
            (m) => m.CaregiverDashboardComponent,
          ),
      },
      {
        path: 'patients/:id/tracking',
        loadComponent: () =>
          import('./features/patients/patient-tracking/patient-tracking').then(
            (m) => m.PatientTrackingComponent,
          ),
      },
      {
        path: 'patients/:id/medical-report',
        loadComponent: () =>
          import('./features/patients/patient-medical-report/patient-medical-report').then(
            (m) => m.PatientMedicalReportComponent,
          ),
      },
      {
        path: 'patients/:id/profile',
        title: 'Profil Patient',
        loadComponent: () =>
          import('./features/patients/patient-profile/patient-profile').then((m) => m.PatientProfileComponent),
      },
      {
        path: 'patients',
        title: 'Liste des Patients',
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
        title: 'Mon Profil',
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
    path: 'alerts/predictions',
    loadComponent: () => import('./features/alerts/pages/alert-prediction/alert-prediction').then(m => m.AlertPredictionComponent)
},
      {
        path: 'alerts/:id',
        title: 'Détails de l\'Alerte',
        loadComponent: () =>
          import('./features/alerts/pages/alert-detail/alert-detail').then(
            (m) => m.AlertDetailComponent,
          ),
      },
      {
        path: 'alerts',
        title: 'Alertes',
        loadComponent: () =>
          import('./features/alerts/pages/alert-list/alert-list').then((m) => m.AlertListComponent),
      },
      // --- STOCK MANAGEMENT FRONT OFFICE ---
      {
        path: 'store',
        loadComponent: () => import('./features/stock-front/accueil/accueil.component').then(m => m.AccueilComponent)
      },
      {
        path: 'store/catalogue',
        loadComponent: () => import('./features/stock-front/catalogue/catalogue.component').then(m => m.CatalogueComponent)
      },
      {
        path: 'store/catalogue/:id',
        loadComponent: () => import('./features/stock-front/detail-produit/detail-produit.component').then(m => m.DetailProduitComponent)
      },
      {
        path: 'store/categories/:id',
        loadComponent: () => import('./features/stock-front/categorie-produits/categorie-produits.component').then(m => m.CategorieProduitsComponent)
      },
      {
        path: 'store/panier',
        loadComponent: () => import('./features/stock-front/panier/panier.component').then(m => m.PanierComponent)
      },
      {
        path: 'store/wishlist',
        loadComponent: () => import('./features/stock-front/wishlist/wishlist.component').then(m => m.WishlistComponent)
      },
      {
        path: 'store/comparer',
        loadComponent: () => import('./features/stock-front/comparer/comparer.component').then(m => m.ComparerComponent)
      },
      {
        path: 'store/commander',
        loadComponent: () => import('./features/stock-front/commander/commander.component').then(m => m.CommanderComponent)
      },
      {
        path: 'store/commande/:ref',
        loadComponent: () => import('./features/stock-front/confirmation-commande/confirmation-commande.component').then(m => m.ConfirmationCommandeComponent)
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // 3. Default Redirects
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }, // 404 - Page not found
];
