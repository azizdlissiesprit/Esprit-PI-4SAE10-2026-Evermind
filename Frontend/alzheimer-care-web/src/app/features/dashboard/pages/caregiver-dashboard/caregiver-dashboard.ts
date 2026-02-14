import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-caregiver-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caregiver-dashboard.html',
  styleUrls: ['./caregiver-dashboard.scss']
})
export class CaregiverDashboardComponent implements OnInit {
  userName: string = 'Caregiver';
  currentDate = new Date();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Retrieve name from local storage (saved during login)
    // You might need to update your AuthService to save 'firstName' specifically
    const storedName = localStorage.getItem('user_name'); 
    if (storedName) {
      this.userName = storedName;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}