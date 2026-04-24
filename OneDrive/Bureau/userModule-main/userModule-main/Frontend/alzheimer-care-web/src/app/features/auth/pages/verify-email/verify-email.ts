import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verify-email-container">
      <div class="verify-card">
        <!-- État de chargement -->
        <div *ngIf="isVerifying" class="loading-state">
          <div class="spinner"></div>
          <h1>Vérification en cours...</h1>
          <p>Veuillez patienter pendant que nous vérifions votre compte.</p>
        </div>

        <!-- État de succès -->
        <div *ngIf="!isVerifying && isSuccess" class="success-state">
          <div class="icon-circle success">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          
          <h1>Compte vérifié ! ✅</h1>
          
          <p class="main-message">
            Votre compte a été activé avec succès.
          </p>
          
          <div class="info-box success">
            <i class="fa-solid fa-check-circle"></i>
            <div>
              <p><strong>Félicitations ! 🎉</strong></p>
              <p class="small">
                Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités d'EverMind.
              </p>
            </div>
          </div>

          <div class="actions">
            <a routerLink="/auth/login" class="btn-primary">
              <i class="fa-solid fa-sign-in-alt"></i> Se connecter
            </a>
          </div>
        </div>

        <!-- État d'erreur -->
        <div *ngIf="!isVerifying && !isSuccess" class="error-state">
          <div class="icon-circle error">
            <i class="fa-solid fa-circle-xmark"></i>
          </div>
          
          <h1>Échec de la vérification ❌</h1>
          
          <p class="main-message">
            Impossible de vérifier votre compte.
          </p>
          
          <div class="info-box error">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <div>
              <p><strong>Raisons possibles :</strong></p>
              <ul class="error-list">
                <li>Le lien de vérification est invalide ou expiré</li>
                <li>Le compte a déjà été vérifié</li>
                <li>Le lien a été utilisé précédemment</li>
              </ul>
            </div>
          </div>

          <div class="actions">
            <a routerLink="/auth/register" class="btn-secondary">
              <i class="fa-solid fa-user-plus"></i> Réessayer l'inscription
            </a>
            <a routerLink="/auth/login" class="btn-tertiary">
              <i class="fa-solid fa-arrow-left"></i> Retour à la connexion
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verify-email-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .verify-card {
      background: white;
      border-radius: 20px;
      padding: 50px 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }

    /* État de chargement */
    .loading-state {
      padding: 20px;
    }

    .spinner {
      width: 60px;
      height: 60px;
      margin: 0 auto 30px;
      border: 6px solid #f3f3f3;
      border-top: 6px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .icon-circle {
      width: 100px;
      height: 100px;
      margin: 0 auto 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 50px;
      color: white;
      animation: scaleIn 0.5s ease-out;
    }

    .icon-circle.success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .icon-circle.error {
      background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
    }
    
    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    
    h1 {
      color: #333;
      font-size: 32px;
      margin-bottom: 15px;
      font-weight: bold;
    }
    
    .main-message {
      color: #666;
      font-size: 18px;
      margin-bottom: 30px;
    }
    
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      display: flex;
      align-items: flex-start;
      gap: 15px;
      text-align: left;
    }

    .info-box.success {
      background: #d4edda;
      border-left-color: #28a745;
    }

    .info-box.error {
      background: #f8d7da;
      border-left-color: #dc3545;
    }
    
    .info-box i {
      font-size: 24px;
      color: #667eea;
      margin-top: 3px;
    }

    .info-box.success i {
      color: #28a745;
    }

    .info-box.error i {
      color: #dc3545;
    }
    
    .info-box p {
      margin: 5px 0;
      color: #333;
    }
    
    .info-box .small {
      font-size: 14px;
      color: #666;
    }

    .error-list {
      margin: 10px 0 0 0;
      padding-left: 20px;
      color: #666;
      font-size: 14px;
    }

    .error-list li {
      margin: 5px 0;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 30px;
    }
    
    .btn-primary,
    .btn-secondary,
    .btn-tertiary {
      padding: 15px 30px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }
    
    .btn-secondary {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }
    
    .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(245, 87, 108, 0.4);
    }

    .btn-tertiary {
      background: #f8f9fa;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-tertiary:hover {
      background: #667eea;
      color: white;
    }
    
    @media (max-width: 768px) {
      .verify-card {
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      .main-message {
        font-size: 16px;
      }
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  isVerifying = true;
  isSuccess = false;
  verificationCode: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer le code de vérification depuis l'URL
    this.verificationCode = this.route.snapshot.queryParamMap.get('code');

    if (!this.verificationCode) {
      console.error('❌ Aucun code de vérification fourni');
      this.isVerifying = false;
      this.isSuccess = false;
      return;
    }

    console.log('🔍 Code de vérification reçu:', this.verificationCode);

    // Appeler le service pour vérifier le compte
    this.authService.verifyEmail(this.verificationCode).subscribe({
      next: (response) => {
        console.log('✅ Vérification réussie:', response);
        this.isVerifying = false;
        this.isSuccess = true;
      },
      error: (error) => {
        console.error('❌ Échec de la vérification:', error);
        this.isVerifying = false;
        this.isSuccess = false;
      }
    });
  }
}
