import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export type FormationStep = 1 | 2 | 3 | 4 | 5;

@Component({
  selector: 'app-formation-stepper',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="stepper">
      <div class="step" [class.active]="currentStep >= 1" [class.done]="currentStep > 1">
        <span class="step-num">1</span>
        <span class="step-label">Catalogue</span>
      </div>
      <div class="line" [class.done]="currentStep > 1"></div>
      <div class="step" [class.active]="currentStep >= 2" [class.done]="currentStep > 2">
        <span class="step-num">2</span>
        <span class="step-label">Modules</span>
      </div>
      <div class="line" [class.done]="currentStep > 2"></div>
      <div class="step" [class.active]="currentStep >= 3" [class.done]="currentStep > 3">
        <span class="step-num">3</span>
        <span class="step-label">Contenu</span>
      </div>
      <div class="line" [class.done]="currentStep > 3"></div>
      <div class="step" [class.active]="currentStep >= 4" [class.done]="currentStep > 4">
        <span class="step-num">4</span>
        <span class="step-label">Quiz</span>
      </div>
      <div class="line" [class.done]="currentStep > 4"></div>
      <div class="step" [class.active]="currentStep >= 5" [class.done]="currentStep > 5">
        <span class="step-num">5</span>
        <span class="step-label">Certificat</span>
      </div>
    </div>
  `,
  styles: [`
    .stepper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 16px 0 24px;
      flex-wrap: wrap;
    }
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      transition: all 0.3s;
    }
    .step.active .step-num {
      background: linear-gradient(135deg, #6366f1, #818cf8);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .step.done .step-num {
      background: rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }
    .step-label {
      font-size: 0.7rem;
      color: #64748b;
    }
    .step.active .step-label { color: #818cf8; }
    .step.done .step-label { color: #22c55e; }
    .line {
      width: 24px;
      height: 2px;
      background: rgba(255,255,255,0.08);
      transition: background 0.3s;
    }
    .line.done { background: rgba(34, 197, 94, 0.5); }
  `]
})
export class FormationStepperComponent {
  @Input() currentStep: FormationStep = 1;
}
