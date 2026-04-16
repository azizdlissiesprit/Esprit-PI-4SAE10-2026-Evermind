import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfileComponent implements OnInit {
  currentUser: any;
  isEditing = false;
  editForm = {
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.editForm = { ...this.currentUser };
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserProfile();
    }
  }

  saveProfile() {
    // In a real app, this would call an API to update the profile
    console.log('Saving profile:', this.editForm);
    // For now, just update localStorage
    localStorage.setItem('first_name', this.editForm.firstName);
    localStorage.setItem('last_name', this.editForm.lastName);
    this.isEditing = false;
    this.loadUserProfile();
  }
}
