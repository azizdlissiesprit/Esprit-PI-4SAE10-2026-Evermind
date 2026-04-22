import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { SessionTimerService } from '../../../core/services/session-timer.service';
import { Subscription } from 'rxjs';

// Import the sub-components
import { CaregiverProfileComponent } from '../components/caregiver-profile/caregiver-profile';
import { DoctorProfileComponent } from '../components/doctor-profile/doctor-profile';
import { RelativeProfileComponent } from '../components/relative-profile/relative-profile';

@Component({
  selector: 'app-profile-container',
  standalone: true,
  imports: [CommonModule, CaregiverProfileComponent, DoctorProfileComponent, RelativeProfileComponent],
  template: `
    <div class="profile-wrapper">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <p>Loading profile...</p>
      </div>
      
      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="error-state">
        <p>{{ error }}</p>
      </div>

      <ng-container *ngIf="!isLoading && currentUser">
        <!-- 1. Caregiver View -->
        <app-caregiver-profile 
          *ngIf="userRole === 'AIDANT' || userRole === 'INFIRMIER'" 
          [userData]="currentUser"
          [sessionTime]="formattedSessionTime">
        </app-caregiver-profile>

        <!-- 2. Doctor View -->
        <app-doctor-profile 
          *ngIf="userRole === 'MEDECIN'" 
          [userData]="currentUser"
          [sessionTime]="formattedSessionTime">
        </app-doctor-profile>

        <!-- 3. Relative View -->
        <app-relative-profile 
          *ngIf="userRole === 'RESPONSABLE' || userRole === 'FAMILLE'" 
          [userData]="currentUser"
          [sessionTime]="formattedSessionTime">
        </app-relative-profile>
        
        <!-- Fallback / Error -->
        <div *ngIf="userRole && !isRoleRecognized()">
          <p>Unknown User Role: {{ userRole }}</p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .loading-state, .error-state {
      padding: 40px;
      text-align: center;
      font-family: 'Inter', sans-serif;
      color: #6B7280;
    }
  `]
})
export class ProfileContainerComponent implements OnInit, OnDestroy {
  userRole: string | null = null;
  currentUser: any = null; // Object to hold full user data from DB
  isLoading = true;
  error = '';
  
  formattedSessionTime: string = '00:00:00';
  private timerSub?: Subscription;

  constructor(
    private authService: AuthService,
    private adminUserService: AdminUserService,
    private sessionTimer: SessionTimerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    console.log('[ProfileContainer] ngOnInit started');
    
    // Subscribe to session timer
    this.timerSub = this.sessionTimer.elapsedSeconds$.subscribe((seconds: number) => {
      this.formattedSessionTime = this.sessionTimer.formatDuration(seconds);
    });

    // 1. Safe check for Browser Environment
    if (isPlatformBrowser(this.platformId)) {
      this.userRole = this.authService.getUserRole();
      console.log('[ProfileContainer] userRole from authService:', this.userRole);
      
      const userIdStr = localStorage.getItem('user_id');
      console.log('[ProfileContainer] userIdStr from localStorage:', userIdStr);
      
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        console.log('[ProfileContainer] Parsed userId:', userId);
        
        console.log('[ProfileContainer] Making API call to AdminUserService.getUserById...');
        this.adminUserService.getUserById(userId).subscribe({
          next: (user: any) => {
            console.log('[ProfileContainer] API call SUCCESS. User data received:', user);
            this.currentUser = user;
            this.isLoading = false;
          },
          error: (err: any) => {
            console.error('[ProfileContainer] API call FAILED. Error details:', err);
            this.error = 'Failed to load full profile data from server.';
            // Fallback to basic local storage data
            this.currentUser = {
              firstName: localStorage.getItem('first_name'),
              lastName: localStorage.getItem('last_name'),
              email: localStorage.getItem('email'),
              userType: this.userRole
            };
            console.log('[ProfileContainer] Set fallback currentUser data:', this.currentUser);
            this.isLoading = false;
          }
        });
      } else {
        console.warn('[ProfileContainer] No user_id found in localStorage');
        this.error = 'User ID not found in session.';
        this.isLoading = false;
      }
    } else {
      console.log('[ProfileContainer] Not running in Browser platform');
      this.isLoading = false;
    }
  }

  isRoleRecognized(): boolean {
    const validRoles = ['AIDANT', 'MEDECIN', 'RESPONSABLE', 'FAMILLE', 'INFIRMIER'];
    return validRoles.includes(this.userRole || '');
  }

  ngOnDestroy() {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }
}

