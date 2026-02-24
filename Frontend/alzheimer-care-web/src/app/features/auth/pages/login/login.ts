import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
// Import Service and Model
import { AuthService } from '../../../../core/services/auth.service'; 
import { LoginRequest } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string = ''; // New variable for error display

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService // Inject Service
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

    onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true; // Start loading
    
    // 1. Prepare data
    const request = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    console.log('Attempting login with:', request.email);

    // 2. Call Service
    this.authService.login(request).subscribe({
      next: (response) => {
        console.log('Login Success:', response);
        this.isLoading = false; // <--- STOP LOADING
        this.router.navigate(['/app/dashboard']); // Navigate to dashboard
      },
      error: (err) => {
        console.error('Login Failed:', err); // Log the exact error
        this.isLoading = false; // <--- CRITICAL: STOP LOADING ON ERROR
        
        // Show alert or set error message variable
        alert('Login failed! Check console for details.'); 
      }
    });
  }
}