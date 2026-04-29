import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const request = {
      email: this.forgotPasswordForm.value.email,
      captchaToken: this.forgotPasswordForm.value.recaptcha,
    };

    this.authService.forgotPassword(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password reset email sent. Please check your inbox.';
        this.forgotPasswordForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        if (error?.status === 403) {
          this.errorMessage =
            (typeof error?.error === 'string' && error.error) ||
            'Acces refuse (403). Verifiez le captcha ou les regles de securite backend.';
          return;
        }
        this.errorMessage =
          (typeof error?.error === 'string' && error.error) ||
          error?.error?.message ||
          'Failed to send reset email. Please check your email address.';
      },
    });
  }
}
