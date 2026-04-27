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

  @Input() sessionTime: string = '00:00:00';

  // Removed mock data for clean UI
}
