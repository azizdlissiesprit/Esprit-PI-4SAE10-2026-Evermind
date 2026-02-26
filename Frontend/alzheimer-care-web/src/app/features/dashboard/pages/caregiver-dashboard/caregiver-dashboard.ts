import { Component, OnInit, Inject, PLATFORM_ID  } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

// Define a simple interface for tasks
interface CareTask {
  id: number;
  time: string;
  category: string;
  patientName: string;
  description: string;
  status: 'DONE' | 'PENDING' | 'UPCOMING';
}

@Component({
  selector: 'app-caregiver-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caregiver-dashboard.html',
  styleUrls: ['./caregiver-dashboard.scss']
})
export class CaregiverDashboardComponent implements OnInit {
  userName: string = 'Caregiver';
  
  // Data for the checklist
  carePlanTasks: CareTask[] = [
    { 
      id: 1, 
      time: '09:00', 
      category: 'Medication', 
      patientName: 'Eleanor Stewart', 
      description: 'Morning pills', 
      status: 'DONE' 
    },
    { 
      id: 2, 
      time: '10:00', 
      category: 'Hydration check', 
      patientName: 'John Miller', 
      description: '1 glass of water', 
      status: 'PENDING' 
    },
    { 
      id: 3, 
      time: '11:30', 
      category: 'Mobility exercise', 
      patientName: 'Maria Lopez', 
      description: 'Short walk', 
      status: 'UPCOMING' 
    },
    { 
      id: 4, 
      time: '14:00', 
      category: 'Wound dressing', 
      patientName: 'Eleanor Stewart', 
      description: 'Check left knee', 
      status: 'UPCOMING' 
    }
  ];

  constructor(
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // <--- INJECT THIS
  ) {}

    ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
        // --- FIX: Use 'first_name' instead of 'user_name' ---
        const firstName = localStorage.getItem('first_name');
        const lastName = localStorage.getItem('last_name'); // Optional

        if (firstName) {
            // You can use just the first name, or combine them
            this.userName = firstName; 
            // Or: this.userName = `${firstName} ${lastName}`;
        }
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Toggle Logic
  toggleTask(task: CareTask) {
    // If it's done, move back to pending. If pending/upcoming, move to done.
    if (task.status === 'DONE') {
      task.status = 'PENDING';
    } else {
      task.status = 'DONE';
    }
  }

  // Helper for badge class
  getBadgeClass(status: string): string {
    switch (status) {
      case 'DONE': return 'badge-done';
      case 'PENDING': return 'badge-pending';
      default: return 'badge-upcoming';
    }
  }
}