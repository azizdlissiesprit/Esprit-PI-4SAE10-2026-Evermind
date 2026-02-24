import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
// Import AuthService AND RegisterRequest Interface
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/auth.models'; // <--- ADD THIS IMPORT

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.errorMessage = "Passwords do not match.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // --- FIX IS HERE ---
    // Explicitly type the variable as 'RegisterRequest'
    const request: RegisterRequest = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phoneNumber: '00000000',
      userType: 'AIDANT' // TypeScript now accepts this because it matches the interface
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        console.log('Registration Success', response);
        this.isLoading = false;
        this.router.navigate(['/app/dashboard']); 
      },
      error: (error) => {
        console.error('Registration Failed', error);
        this.isLoading = false;
        this.errorMessage = 'Registration failed. Email might already exist.';
      }
    });
  }
}