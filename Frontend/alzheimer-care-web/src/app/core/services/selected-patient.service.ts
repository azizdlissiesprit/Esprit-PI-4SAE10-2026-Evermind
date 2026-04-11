import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedPatientService {
  private selectedPatientSubject = new BehaviorSubject<any>(null);
  selectedPatient$ = this.selectedPatientSubject.asObservable();

  setSelectedPatient(patient: any) {
    this.selectedPatientSubject.next(patient);
  }

  getSelectedPatient() {
    return this.selectedPatientSubject.value;
  }

  clearSelectedPatient() {
    this.selectedPatientSubject.next(null);
  }

  // Additional methods for compatibility
  set(patientId: any) {
    this.selectedPatientSubject.next(patientId);
  }

  get() {
    return this.selectedPatientSubject.value;
  }
}
