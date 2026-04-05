import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha-2';
import { LoginRequest } from '../../../../core/models/auth.models';
import { AuthService } from '../../../../core/services/auth.service';
import { getRoleHomeRoute } from '../../../../core/utils/role-routing';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RecaptchaModule, RecaptchaFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
      recaptcha: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const request: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      captchaToken: this.loginForm.value.recaptcha
    };

    this.authService.login(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        const rawResponse = response as any;
        const resolvedRole =
          rawResponse?.role ||
          rawResponse?.userType ||
          rawResponse?.user?.role ||
          rawResponse?.user?.userType ||
          this.authService.getRole();

        this.router.navigate([getRoleHomeRoute(resolvedRole)]);
      },
      error: (err) => {
        this.isLoading = false;
        const backendMessage = this.extractBackendMessage(err);

        if (err?.status === 403) {
          this.errorMessage =
            backendMessage ||
            'Acces refuse. Votre compte est peut-etre banni ou non verifie.';
          return;
        }

        this.errorMessage = backendMessage || 'Email ou mot de passe incorrect.';
      }
    });
  }

  private extractBackendMessage(err: any): string {
    if (!err) return '';

    if (typeof err.error === 'string' && err.error.trim()) {
      return err.error.trim();
    }

    const candidates = [
      err?.error?.message,
      err?.error?.detail,
      err?.error?.error,
      err?.error?.title
    ];

    const found = candidates.find((value) => typeof value === 'string' && value.trim());
    return found ? found.trim() : '';
  }
}
