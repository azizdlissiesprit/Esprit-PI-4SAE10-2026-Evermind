import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

// Import the sub-components
import { CaregiverProfileComponent } from '../components/caregiver-profile/caregiver-profile';
import { DoctorProfileComponent } from '../components/doctor-profile/doctor-profile';
import { RelativeProfileComponent } from '../components/relative-profile/relative-profile';

@Component({
  selector: 'app-profile-container',
  standalone: true,
  // Import sub-components here so they can be used in HTML
  imports: [CommonModule, CaregiverProfileComponent, DoctorProfileComponent, RelativeProfileComponent],
  template: `
    <div class="profile-wrapper">
      <!-- Loading State -->
      <div *ngIf="!userRole">Loading profile...</div>

      <!-- 1. Caregiver View -->
      <app-caregiver-profile 
        *ngIf="userRole === 'AIDANT'" 
        [userData]="currentUser">
      </app-caregiver-profile>

      <!-- 2. Doctor View -->
      <app-doctor-profile 
        *ngIf="userRole === 'MEDECIN'" 
        [userData]="currentUser">
      </app-doctor-profile>

      <!-- 3. Relative View -->
      <app-relative-profile 
        *ngIf="userRole === 'RESPONSABLE' || userRole === 'FAMILLE'" 
        [userData]="currentUser">
      </app-relative-profile>
      
      <!-- Fallback / Error -->
      <div *ngIf="userRole && !isRoleRecognized()">
        <p>Unknown User Role: {{ userRole }}</p>
      </div>
    </div>
  `
})
export class ProfileContainerComponent implements OnInit {
  userRole: string | null = null;
  currentUser: any = null; // Object to hold firstName, lastName, email, etc.

  constructor(private authService: AuthService,@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // 1. Safe check for Browser Environment
    if (isPlatformBrowser(this.platformId)) {
      
      this.userRole = this.authService.getUserRole();

      // safely access localStorage here
      this.currentUser = {
        firstName: localStorage.getItem('first_name'),
        lastName: localStorage.getItem('last_name'),
        email: localStorage.getItem('email'),
        role: this.userRole
      };
    }
  }

  isRoleRecognized(): boolean {
    const validRoles = ['AIDANT', 'MEDECIN', 'RESPONSABLE', 'FAMILLE'];
    return validRoles.includes(this.userRole || '');
  }
}