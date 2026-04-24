import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registration-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="registration-success-container">
      <div class="success-card">
        <div class="icon-circle">
          <i class="fa-solid fa-envelope-circle-check"></i>
        </div>
        
        <h1>Inscription réussie ! 🎉</h1>
        
        <p class="main-message">
          Votre compte a été créé avec succès.
        </p>
        
        <div class="info-box">
          <i class="fa-solid fa-info-circle"></i>
          <div>
            <p><strong>Étape suivante :</strong> Vérifiez votre boîte email</p>
            <p class="small">
              Nous vous avons envoyé un email de vérification. 
              Cliquez sur le bouton dans l'email pour activer votre compte.
            </p>
          </div>
        </div>
        
        <div class="warning-box">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <p>
            <strong>Important :</strong> Vous ne pourrez pas vous connecter tant que votre compte n'est pas vérifié.
          </p>
        </div>
        
        <div class="tips">
          <h3>L'email n'arrive pas ?</h3>
          <ul>
            <li><i class="fa-solid fa-check"></i> Vérifiez votre dossier spam/courrier indésirable</li>
            <li><i class="fa-solid fa-check"></i> Attendez quelques minutes (peut prendre jusqu'à 5 min)</li>
            <li><i class="fa-solid fa-check"></i> Vérifiez que l'adresse email est correcte</li>
          </ul>
        </div>
        
        <div class="actions">
          <a routerLink="/auth/login" class="btn-secondary">
            <i class="fa-solid fa-arrow-left"></i> Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .registration-success-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .success-card {
      background: white;
      border-radius: 20px;
      padding: 50px 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }
    
    .icon-circle {
      width: 100px;
      height: 100px;
      margin: 0 auto 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 50px;
      color: white;
      animation: scaleIn 0.5s ease-out;
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
    
    .info-box, .warning-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      text-align: left;
      display: flex;
      gap: 15px;
      align-items: flex-start;
    }
    
    .warning-box {
      background: #fff3cd;
      border-left-color: #ffc107;
    }
    
    .info-box i, .warning-box i {
      font-size: 24px;
      color: #2196f3;
      flex-shrink: 0;
    }
    
    .warning-box i {
      color: #ffc107;
    }
    
    .info-box p, .warning-box p {
      margin: 0;
      color: #333;
      line-height: 1.6;
    }
    
    .small {
      font-size: 14px;
      color: #666;
      margin-top: 8px !important;
    }
    
    .tips {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 10px;
      margin: 30px 0;
      text-align: left;
    }
    
    .tips h3 {
      color: #333;
      font-size: 18px;
      margin: 0 0 15px 0;
      text-align: center;
    }
    
    .tips ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .tips li {
      padding: 10px 0;
      color: #555;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .tips li i {
      color: #4caf50;
      font-size: 16px;
    }
    
    .actions {
      margin-top: 30px;
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    
    .btn-secondary {
      display: inline-block;
      padding: 12px 30px;
      background: #6c757d;
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
      background: #5a6268;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
    }
    
    @media (max-width: 768px) {
      .success-card {
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      .icon-circle {
        width: 80px;
        height: 80px;
        font-size: 40px;
      }
    }
  `]
})
export class RegistrationSuccessComponent {}
