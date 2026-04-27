import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha-2';
import { LoginRequest } from '../../../../core/models/auth.models';
import { AuthService } from '../../../../core/services/auth.service';
import { getRoleHomeRoute } from '../../../../core/utils/role-routing';
import { FaceCaptureComponent } from '../../components/face-capture/face-capture';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    FaceCaptureComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  faceImage: File | null = null;
  loginMode: 'classic' | 'face' = 'face';

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

    this.applyLoginModeValidators();
  }

  onFaceSelected(file: File | null): void {
    this.faceImage = file;
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  setLoginMode(mode: 'classic' | 'face'): void {
    this.loginMode = mode;
    this.errorMessage = '';
    this.applyLoginModeValidators();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    if (this.loginMode === 'face' && !this.faceImage) {
      this.errorMessage = 'Capture or upload a face photo to continue.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      captchaToken: this.loginForm.value.recaptcha
    };

    console.log('[LoginComponent] onSubmit - mode:', this.loginMode, 'email:', request.email, 'faceImage:', this.faceImage?.name ?? 'NONE');

    const request$ =
      this.loginMode === 'face'
        ? this.authService.loginWithFace(request, this.faceImage)
        : this.authService.login(request);

    request$.subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('[LoginComponent] onSubmit - SUCCESS response:', response);
        const rawResponse = response as any;
        const resolvedRole =
          rawResponse?.role ||
          rawResponse?.userType ||
          rawResponse?.user?.role ||
          rawResponse?.user?.userType ||
          this.authService.getRole();

        console.log('[LoginComponent] onSubmit - resolvedRole:', resolvedRole, 'navigating to:', getRoleHomeRoute(resolvedRole));
        this.router.navigate([getRoleHomeRoute(resolvedRole)]);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('[LoginComponent] onSubmit - ERROR status:', err?.status);
        console.error('[LoginComponent] onSubmit - ERROR body:', err?.error);
        console.error('[LoginComponent] onSubmit - ERROR message:', err?.message);
        console.error('[LoginComponent] onSubmit - ERROR full:', err);

        if (err?.status === 403) {
          this.errorMessage = err?.error?.message || err?.error?.detail || 'Login denied.';
          return;
        }

        if (err?.status === 400 || err?.status === 401) {
          this.errorMessage = err?.error?.message || err?.error?.detail || 'Invalid credentials. Try again.';
          return;
        }

        this.errorMessage = err?.error?.message || err?.error?.detail || (this.loginMode === 'face' ? 'Face login failed. Check console for details.' : 'Login denied.');
      }
    });
  }

  get passwordControl(): FormControl<string | null> {
    return this.loginForm.get('password') as FormControl<string | null>;
  }

  private applyLoginModeValidators(): void {
    if (this.loginMode === 'classic') {
      this.passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      this.passwordControl.clearValidators();
      this.passwordControl.setValue('');
    }

    this.passwordControl.updateValueAndValidity({ emitEvent: false });
  }
}
