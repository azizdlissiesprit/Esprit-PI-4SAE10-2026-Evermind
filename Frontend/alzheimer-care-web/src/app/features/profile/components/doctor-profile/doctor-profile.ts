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
  @Input() userData: any;
  @Input() sessionTime: string = '00:00:00';
}

