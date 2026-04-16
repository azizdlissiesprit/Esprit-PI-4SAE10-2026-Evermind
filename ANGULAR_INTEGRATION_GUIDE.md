# 🌐 Guide d'Intégration Frontend - Angular + JWT Authentication

## 📋 Table des matières
1. [Architecture Angular](#architecture-angular)
2. [Services à créer](#services-à-créer)
3. [Interceptor HTTP](#interceptor-http)
4. [Guards de Routes](#guards-de-routes)
5. [Composants](#composants)
6. [Stockage du Token](#stockage-du-token)
7. [Intégration Complète](#intégration-complète)

---

## 🏗️ Architecture Angular

```
Frontend/alzheimer-care-web/src/app/
├── services/
│   ├── auth.service.ts         (API calls, login/signup)
│   ├── token.service.ts        (Stockage/récupération token)
│   └── user.service.ts         (Infos utilisateur)
├── interceptors/
│   └── auth.interceptor.ts     (Ajoute le token à chaque requête)
├── guards/
│   ├── auth.guard.ts           (Vérifie authentification)
│   └── role.guard.ts           (Vérifie les rôles)
├── components/
│   ├── login/
│   │   ├── login.component.ts
│   │   ├── login.component.html
│   │   └── login.component.css
│   ├── signup/
│   │   ├── signup.component.ts
│   │   ├── signup.component.html
│   │   └── signup.component.css
│   └── navbar/
│       ├── navbar.component.ts
│       ├── navbar.component.html
│       └── navbar.component.css
└── models/
    ├── auth-request.model.ts
    ├── auth-response.model.ts
    └── user.model.ts
```

---

## 🔧 Services à créer

### 1. TokenService (Gestion du token)

**File:** `src/app/services/token.service.ts`

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  // Stocker le token
  public saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Récupérer le token
  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Stocker le refresh token
  public saveRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  // Récupérer le refresh token
  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Stocker les infos utilisateur
  public saveUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Récupérer les infos utilisateur
  public getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Vérifier si authentifié
  public isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Vérifier si admin
  public isAdmin(): boolean {
    const user = this.getUser();
    return user && user.roles && user.roles.includes('ROLE_ADMIN');
  }

  // Vérifier si aidant
  public isAidant(): boolean {
    const user = this.getUser();
    return user && user.roles && user.roles.includes('ROLE_AIDANT');
  }

  // Avoir un rôle
  public hasRole(role: string): boolean {
    const user = this.getUser();
    return user && user.roles && user.roles.includes(role);
  }

  // Supprimer le token (logout)
  public clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
```

### 2. AuthService (Appels API)

**File:** `src/app/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { TokenService } from './token.service';

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface SignUpRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  confirmMotDePasse: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  email: string;
  nom: string;
  prenom: string;
  roles: string[];
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9086/auth';
  private authStatusSubject = new BehaviorSubject<boolean>(this.tokenService.isAuthenticated());
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   */
  signup(signupRequest: SignUpRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, signupRequest)
      .pipe(
        tap(() => {
          console.log('Inscription réussie');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Connexion utilisateur
   */
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap((response: AuthResponse) => {
          this.tokenService.saveToken(response.token);
          this.tokenService.saveRefreshToken(response.refreshToken);
          this.tokenService.saveUser({
            id: response.id,
            email: response.email,
            nom: response.nom,
            prenom: response.prenom,
            roles: response.roles
          });
          this.authStatusSubject.next(true);
          console.log('Connexion réussie', response);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupérer les infos de l'utilisateur courant
   */
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Vérifier l'authentification
   */
  checkAuth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.tokenService.clearToken();
    this.authStatusSubject.next(false);
    console.log('Déconnexion réussie');
  }

  /**
   * Obtenir le statut d'authentification
   */
  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = error.error.message;
    } else {
      // Erreur côté serveur
      errorMessage = error.error?.message || error.statusText;
    }
    
    console.error('Erreur:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

### 3. UserService (Gestion utilisateur)

**File:** `src/app/services/user.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:9086/admin/users';

  constructor(private http: HttpClient) {}

  /**
   * Récupérer les infos d'un utilisateur (admin)
   */
  getUserInfo(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Désactiver un utilisateur (admin)
   */
  deactivateUser(userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/deactivate`, {});
  }

  /**
   * Activer un utilisateur (admin)
   */
  activateUser(userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/activate`, {});
  }
}
```

---

## 🔐 Interceptor HTTP

**File:** `src/app/interceptors/auth.interceptor.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Récupérer le token
    const token = this.tokenService.getToken();

    // Ajouter le token au header Authorization si le token existe
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gérer les erreurs 401 Unauthorized
        if (error.status === 401) {
          // Token expiré ou invalide
          this.tokenService.clearToken();
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }
}
```

---

## 🛡️ Guards de Routes

### 1. AuthGuard (Vérifier authentification)

**File:** `src/app/guards/auth.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.tokenService.isAuthenticated()) {
      return true;
    }

    // Rediriger vers login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
```

### 2. RoleGuard (Vérifier les rôles)

**File:** `src/app/guards/role.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRole = route.data['role'];

    if (!requiredRole) {
      return true;
    }

    if (this.tokenService.hasRole(requiredRole)) {
      return true;
    }

    // Accès refusé
    this.router.navigate(['/access-denied']);
    return false;
  }
}
```

---

## 📝 Composants

### 1. Login Component

**File:** `src/app/components/login/login.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]]
    });

    // Obtenir l'URL de redirection
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Connexion réussie', response);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors de la connexion';
        this.loading = false;
      }
    });
  }
}
```

**File:** `src/app/components/login/login.component.html`

```html
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">Connexion</h4>
        </div>
        <div class="card-body">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Email -->
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                formControlName="email"
                [class.is-invalid]="submitted && f['email'].errors"
                placeholder="email@example.com">
              <div class="invalid-feedback" *ngIf="submitted && f['email'].errors">
                <div *ngIf="f['email'].errors['required']">L'email est requis</div>
                <div *ngIf="f['email'].errors['email']">Email invalide</div>
              </div>
            </div>

            <!-- Mot de passe -->
            <div class="mb-3">
              <label for="motDePasse" class="form-label">Mot de passe</label>
              <input 
                type="password" 
                class="form-control" 
                id="motDePasse" 
                formControlName="motDePasse"
                [class.is-invalid]="submitted && f['motDePasse'].errors"
                placeholder="••••••••">
              <div class="invalid-feedback" *ngIf="submitted && f['motDePasse'].errors">
                <div *ngIf="f['motDePasse'].errors['required']">Le mot de passe est requis</div>
                <div *ngIf="f['motDePasse'].errors['minlength']">Min. 8 caractères</div>
              </div>
            </div>

            <!-- Erreur -->
            <div class="alert alert-danger" *ngIf="error">
              {{ error }}
            </div>

            <!-- Bouton -->
            <button 
              type="submit" 
              class="btn btn-primary w-100"
              [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              Connexion
            </button>
          </form>

          <!-- Lien inscription -->
          <div class="mt-3 text-center">
            Pas encore inscrit? 
            <a routerLink="/signup">Créer un compte</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2. SignUp Component

**File:** `src/app/components/signup/signup.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignUpComponent implements OnInit {
  signupForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';

  roles = ['AIDANT', 'ADMIN'];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmMotDePasse: ['', Validators.required],
      role: ['AIDANT', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  get f() {
    return this.signupForm.controls;
  }

  // Validateur personnalisé pour vérifier si les mots de passe correspondent
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const motDePasse = control.get('motDePasse');
    const confirmMotDePasse = control.get('confirmMotDePasse');

    if (!motDePasse || !confirmMotDePasse) {
      return null;
    }

    return motDePasse.value === confirmMotDePasse.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.signup(this.signupForm.value).subscribe({
      next: (response) => {
        this.success = 'Inscription réussie! Redirection vers connexion...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}
```

**File:** `src/app/components/signup/signup.component.html`

```html
<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header bg-success text-white">
          <h4 class="mb-0">Créer un compte</h4>
        </div>
        <div class="card-body">
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
            <!-- Nom -->
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="nom" class="form-label">Nom</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="nom" 
                  formControlName="nom"
                  [class.is-invalid]="submitted && f['nom'].errors"
                  placeholder="Votre nom">
                <div class="invalid-feedback" *ngIf="submitted && f['nom'].errors">
                  Le nom est requis (min. 2 caractères)
                </div>
              </div>

              <!-- Prénom -->
              <div class="col-md-6 mb-3">
                <label for="prenom" class="form-label">Prénom</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="prenom" 
                  formControlName="prenom"
                  [class.is-invalid]="submitted && f['prenom'].errors"
                  placeholder="Votre prénom">
                <div class="invalid-feedback" *ngIf="submitted && f['prenom'].errors">
                  Le prénom est requis (min. 2 caractères)
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                formControlName="email"
                [class.is-invalid]="submitted && f['email'].errors"
                placeholder="email@example.com">
              <div class="invalid-feedback" *ngIf="submitted && f['email'].errors">
                <div *ngIf="f['email'].errors['required']">L'email est requis</div>
                <div *ngIf="f['email'].errors['email']">Email invalide</div>
              </div>
            </div>

            <!-- Mot de passe -->
            <div class="mb-3">
              <label for="motDePasse" class="form-label">Mot de passe</label>
              <input 
                type="password" 
                class="form-control" 
                id="motDePasse" 
                formControlName="motDePasse"
                [class.is-invalid]="submitted && f['motDePasse'].errors"
                placeholder="••••••••">
              <small class="form-text text-muted">Min. 8 caractères</small>
              <div class="invalid-feedback" *ngIf="submitted && f['motDePasse'].errors">
                <div *ngIf="f['motDePasse'].errors['required']">Le mot de passe est requis</div>
                <div *ngIf="f['motDePasse'].errors['minlength']">Min. 8 caractères</div>
              </div>
            </div>

            <!-- Confirmation mot de passe -->
            <div class="mb-3">
              <label for="confirmMotDePasse" class="form-label">Confirmer mot de passe</label>
              <input 
                type="password" 
                class="form-control" 
                id="confirmMotDePasse" 
                formControlName="confirmMotDePasse"
                [class.is-invalid]="submitted && f['confirmMotDePasse'].errors"
                placeholder="••••••••">
              <div class="invalid-feedback" *ngIf="submitted && f['confirmMotDePasse'].errors">
                <div *ngIf="f['confirmMotDePasse'].errors['required']">Confirmer le mot de passe</div>
                <div *ngIf="signupForm.hasError('passwordMismatch') && f['confirmMotDePasse'].touched">
                  Les mots de passe ne correspondent pas
                </div>
              </div>
            </div>

            <!-- Rôle -->
            <div class="mb-3">
              <label for="role" class="form-label">Rôle</label>
              <select 
                class="form-select" 
                id="role" 
                formControlName="role">
                <option value="AIDANT">Aidant</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <!-- Messages d'erreur/succès -->
            <div class="alert alert-danger" *ngIf="error">
              {{ error }}
            </div>
            <div class="alert alert-success" *ngIf="success">
              {{ success }}
            </div>

            <!-- Bouton -->
            <button 
              type="submit" 
              class="btn btn-success w-100"
              [disabled]="loading">
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
              S'inscrire
            </button>
          </form>

          <!-- Lien connexion -->
          <div class="mt-3 text-center">
            Déjà inscrit? 
            <a routerLink="/login">Se connecter</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 📍 Configuration du Routing

**File:** `src/app/app-routing.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  
  // Routes protégées
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardComponent  // À créer
  },
  
  // Routes admin
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ROLE_ADMIN' },
    component: AdminDashboardComponent  // À créer
  },
  
  // Autres routes...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

## 💾 Stockage du Token

### Où stocker le token?

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **localStorage** | Persistent, Simple | Vulnérable aux XSS |
| **sessionStorage** | Sécurisé, Persiste pendant session | Supprimé à la fermeture |
| **Cookie** | HttpOnly (sécurisé XSS) | Complexe à gérer |
| **Memory** | Sécurisé | Perdu au rechargement |

**Recommandation:** localStorage pour l'expérience utilisateur, mais avec HTTPS en production.

---

## 🔗 Intégration Complète

### 1. Importer les modules dans AppModule

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/signup/signup.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 2. Ajouter le navbar avec authentification

```typescript
// navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  currentUser: any = null;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.authStatus$.subscribe(status => {
      this.isAuthenticated = status;
      this.currentUser = this.tokenService.getUser();
      this.isAdmin = this.tokenService.isAdmin();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

```html
<!-- navbar.component.html -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">EverMind</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <!-- Si authentifié -->
        <li class="nav-item" *ngIf="isAuthenticated">
          <span class="nav-link">{{ currentUser?.nom }} {{ currentUser?.prenom }}</span>
        </li>
        
        <!-- Menu Admin -->
        <li class="nav-item" *ngIf="isAuthenticated && isAdmin">
          <a class="nav-link" routerLink="/admin">Admin</a>
        </li>
        
        <!-- Si authentifié: Déconnexion -->
        <li class="nav-item" *ngIf="isAuthenticated">
          <button class="btn btn-danger" (click)="logout()">Déconnexion</button>
        </li>
        
        <!-- Si non authentifié: Connexion/Inscription -->
        <li class="nav-item" *ngIf="!isAuthenticated">
          <a class="nav-link" routerLink="/login">Connexion</a>
        </li>
        <li class="nav-item" *ngIf="!isAuthenticated">
          <a class="nav-link" routerLink="/signup">Inscription</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

---

## ✅ Checklist d'Intégration

- [ ] Créer `services/token.service.ts`
- [ ] Créer `services/auth.service.ts`
- [ ] Créer `services/user.service.ts`
- [ ] Créer `interceptors/auth.interceptor.ts`
- [ ] Créer `guards/auth.guard.ts`
- [ ] Créer `guards/role.guard.ts`
- [ ] Créer composant Login
- [ ] Créer composant SignUp
- [ ] Ajouter AuthInterceptor à AppModule
- [ ] Ajouter routes au routing module
- [ ] Importer ReactiveFormsModule
- [ ] Créer navbar avec authentification
- [ ] Tester inscription
- [ ] Tester connexion
- [ ] Tester routes protégées
- [ ] Vérifier l'envoi du token à chaque requête

---

## 🧪 Commandes utiles

```bash
# Générer les services
ng generate service services/auth
ng generate service services/token
ng generate service services/user

# Générer les interceptors
ng generate interceptor interceptors/auth

# Générer les guards
ng generate guard guards/auth
ng generate guard guards/role

# Générer les composants
ng generate component components/login
ng generate component components/signup
ng generate component components/navbar
```

---

**Prochaine étape:** Tester l'intégration complète en se connectant via le frontend et en vérifiant que le token est envoyé à chaque requête.
