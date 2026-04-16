import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-profile.html',
  styleUrls: ['./doctor-profile.scss']
})
export class DoctorProfileComponent {
  @Input() userData: any = {
    firstName: 'Antonio',
    lastName: 'Rossi',
    specialty: 'Neurology & Geriatrics',
    role: 'Consultant Neurologist',
    hospital: 'St. Marys Hospital',
    department: 'Neurosciences',
    license: 'NPI #1234567890'
  };

  // Mock data for availability
  availability = [
    { label: 'Virtual office hours', value: 'Mon / Wed 10:00 - 12:00' },
    { label: 'In-person rounds', value: 'Daily 07:30 - 09:30 Neuro Wing' }
  ];

  // Mock data for delegates
  delegates = [
    { name: 'Dr. Emily Chen', role: 'Neurology Resident', img: 'https://i.pravatar.cc/150?img=35' },
    { name: 'NP Laura Mendes', role: 'Nurse Practitioner', img: 'https://i.pravatar.cc/150?img=42' }
  ];
}