import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/auth.models';
import { FaceCaptureComponent } from '../../components/face-capture/face-capture';

type UserType = RegisterRequest['userType'];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FaceCaptureComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  registerForm!: FormGroup;

  isLoading = false;
  errorMessage = '';
  submitted = false;
  faceImage: File | null = null;

  roles = [
    { value: 'AIDANT', label: 'Aidant (Caregiver)' },
    { value: 'MEDECIN', label: 'Medecin (Doctor)' },
    { value: 'RESPONSABLE', label: 'Responsable (Manager)' },
    { value: 'ADMIN', label: 'Admin' },
  ] as const;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(20),
            this.passwordValidator.bind(this),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator.bind(this),
      },
    );
  }

  onFaceSelected(file: File | null): void {
    this.faceImage = file;
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '') as string;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    return hasUpperCase && hasLowerCase && hasNumber ? null : { weakPassword: true };
  }

  getPasswordStrength(): {
    level: 'weak' | 'fair' | 'good' | 'strong';
    score: number;
    label: string;
  } {
    const password = this.registerForm.get('password')?.value || '';

    if (!password) {
      return { level: 'weak', score: 0, label: '' };
    }

    let score = 0;
    const checks = {
      length: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password),
      longLength: password.length >= 12,
    };

    if (checks.length) score += 15;
    if (checks.hasUpperCase) score += 15;
    if (checks.hasLowerCase) score += 15;
    if (checks.hasNumber) score += 15;
    if (checks.hasSpecialChar) score += 20;
    if (checks.longLength) score += 20;

    if (score < 30) {
      return { level: 'weak', score: Math.min(25, score), label: 'Weak' };
    } else if (score < 50) {
      return { level: 'fair', score: Math.min(50, score), label: 'Fair' };
    } else if (score < 75) {
      return { level: 'good', score: Math.min(75, score), label: 'Good' };
    } else {
      return { level: 'strong', score: 100, label: 'Strong' };
    }
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    const pass = password.value;
    const confirm = confirmPassword.value;

    if (confirm && pass !== confirm) {
      confirmPassword.setErrors({ ...(confirmPassword.errors || {}), passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword.hasError('passwordMismatch')) {
      const errors = { ...(confirmPassword.errors || {}) };
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors || (!this.submitted && !field.touched && !field.dirty)) return '';

    const fieldLabel = this.getFieldLabel(fieldName);

    if (field.hasError('required')) {
      const messages: Record<string, string> = {
        firstName: 'First name is required',
        lastName: 'Last name is required',
        email: 'Email is required',
        role: 'Please select a role',
        password: 'Password is required',
        confirmPassword: 'Please confirm your password',
      };
      return messages[fieldName] || `${fieldLabel} is required`;
    }

    if (field.hasError('minlength')) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${fieldLabel} must contain at least ${minLength} characters`;
    }

    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `${fieldLabel} must contain at most ${maxLength} characters`;
    }

    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (field.hasError('weakPassword')) {
      const password = field.value || '';
      const errors: string[] = [];

      if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
      if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
      if (!/[0-9]/.test(password)) errors.push('one number');

      return `Password must contain at least ${errors.join(', ')}`;
    }

    if (field.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }

    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      role: 'Role',
      password: 'Password',
      confirmPassword: 'Password confirmation',
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    if (!this.faceImage) {
      this.errorMessage = 'Capture or upload a face photo before creating the account.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const roleValue = this.registerForm.value.role as UserType;

    const request: RegisterRequest = {
      firstName: this.registerForm.value.firstName!,
      lastName: this.registerForm.value.lastName!,
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!,
      phoneNumber: '00000000',
      userType: roleValue,
    };

    console.log(
      '[RegisterComponent] onSubmit - request:',
      { ...request, password: '***' },
      'faceImage:',
      this.faceImage?.name,
      'size:',
      this.faceImage?.size,
    );

    this.authService.registerWithFace(request, this.faceImage).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('[RegisterComponent] onSubmit - SUCCESS response:', res);
        this.router.navigate(['/registration-success']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('[RegisterComponent] onSubmit - ERROR status:', err?.status);
        console.error('[RegisterComponent] onSubmit - ERROR body:', err?.error);
        console.error('[RegisterComponent] onSubmit - ERROR message:', err?.message);
        console.error('[RegisterComponent] onSubmit - ERROR full:', err);
        this.errorMessage =
          err?.error?.message ||
          err?.error?.detail ||
          'Registration failed. Check console for details.';
      },
    });
  }
}
