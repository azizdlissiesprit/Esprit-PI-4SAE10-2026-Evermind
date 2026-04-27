import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { InterventionOutcome } from '../models/enums';

export interface DialogConfig {
  title: string;
  message: string;
  type: 'alert' | 'confirm' | 'resolve';
  confirmText?: string;
  cancelText?: string;
}

export interface DialogResult {
  confirmed: boolean;
  outcome?: InterventionOutcome;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private config = signal<DialogConfig | null>(null);
  private resultSubject = new Subject<DialogResult>();

  readonly activeConfig = this.config.asReadonly();

  open(config: DialogConfig) {
    this.config.set(config);
    this.resultSubject = new Subject<DialogResult>();
    return this.resultSubject.asObservable();
  }

  close(result: DialogResult) {
    this.config.set(null);
    this.resultSubject.next(result);
    this.resultSubject.complete();
  }



  alert(title: string, message: string) {
    return this.open({ title, message, type: 'alert', confirmText: 'OK' });
  }

  confirm(title: string, message: string, confirmText = 'Yes', cancelText = 'Cancel') {
    return this.open({ title, message, type: 'confirm', confirmText, cancelText });
  }

  resolve() {
    return this.open({ 
      title: 'Finalize Intervention', 
      message: 'Provide details about the resolution of this alert.', 
      type: 'resolve',
      confirmText: 'Resolve',
      cancelText: 'Cancel'
    });
  }
}
