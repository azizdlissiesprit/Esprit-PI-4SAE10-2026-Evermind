import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-caregiver-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caregiver-profile.html',
  styleUrls: ['./caregiver-profile.scss']
})
export class CaregiverProfileComponent {
  // Receives data from the parent container
  @Input() userData: any = {
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 's.jenkins@sunrise-care.org',
    role: 'Certified Nursing Assistant',
    phone: '***-***-4821'
  };

  // Mock data for display (in real app, fetch this from backend)
  certifications = [
    { title: 'CPR Certified', expiry: 'March 2025' },
    { title: 'Dementia Care Specialist', expiry: 'Issued by: National Care Council' },
    { title: 'Medication Admin Training', expiry: 'Last refreshed: Jan 2024' }
  ];

  stats = [
    { label: 'Patients monitored', value: 12 },
    { label: 'Hours logged', value: 450 },
    { label: 'Incidents filed', value: 3 }
  ];
}