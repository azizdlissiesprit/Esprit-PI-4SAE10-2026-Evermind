import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DialogResult } from '../../../core/services/dialog.service';
import { InterventionOutcome } from '../../../core/models/enums';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (dialogService.activeConfig(); as config) {
      <div class="modal-backdrop" (click)="onCancel()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ config.title }}</h3>
            <button class="close-btn" (click)="onCancel()">&times;</button>
          </div>
          
          <div class="modal-body">
            <p>{{ config.message }}</p>

            @if (config.type === 'resolve') {
              <div class="resolve-form">
                <div class="form-group">
                  <label for="outcome">Intervention Outcome</label>
                  <select id="outcome" [(ngModel)]="outcome" class="form-control">
                    @for (o of outcomes; track o) {
                      <option [value]="o">{{ o.replace('_', ' ') }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label for="notes">Resolution Notes</label>
                  <textarea id="notes" [(ngModel)]="notes" class="form-control" rows="4" placeholder="Enter details about the intervention..."></textarea>
                </div>
              </div>
            }
          </div>

          <div class="modal-footer">
            @if (config.type !== 'alert') {
              <button class="btn btn-secondary" (click)="onCancel()">{{ config.cancelText || 'Cancel' }}</button>
            }
            <button class="btn btn-primary" (click)="onConfirm()" [disabled]="config.type === 'resolve' && !notes">
              {{ config.confirmText || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
      background: var(--bg-card);
      width: 100%;
      max-width: 500px;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-primary);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .modal-body {
      padding: 24px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .modal-footer {
      padding: 16px 24px;
      background: var(--bg-main);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .resolve-form {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-primary);
    }

    .form-control {
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-card);
      color: var(--text-primary);
      font-family: inherit;
    }

    .form-control:focus {
      outline: 2px solid var(--accent-color);
      border-color: transparent;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-secondary);
    }

    .btn-secondary:hover {
      background: rgba(0,0,0,0.05);
    }

    .btn-primary {
      background: var(--accent-color);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--accent-hover);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ModalComponent {
  dialogService = inject(DialogService);
  
  outcomes = Object.values(InterventionOutcome);
  outcome = InterventionOutcome.ASSISTANCE_GIVEN;
  notes = '';

  onConfirm() {
    const config = this.dialogService.activeConfig();
    const result: DialogResult = { confirmed: true };
    
    if (config?.type === 'resolve') {
      result.outcome = this.outcome;
      result.notes = this.notes;
    }
    
    this.dialogService.close(result);
    this.reset();
  }

  onCancel() {
    this.dialogService.close({ confirmed: false });
    this.reset();
  }



  private reset() {
    this.outcome = InterventionOutcome.ASSISTANCE_GIVEN;
    this.notes = '';
  }
}
