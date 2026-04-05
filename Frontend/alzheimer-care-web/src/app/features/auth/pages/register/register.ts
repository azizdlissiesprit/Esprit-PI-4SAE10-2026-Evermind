import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha-2';

import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/auth.models';

type UserType = RegisterRequest['userType'];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RecaptchaModule, RecaptchaFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm!: FormGroup;

  isLoading = false;
  errorMessage = '';
  submitted = false;

  roles = [
    { value: 'AIDANT', label: 'Aidant (Caregiver)' },
    { value: 'MEDECIN', label: 'Médecin (Doctor)' },
    { value: 'RESPONSABLE', label: 'Responsable (Manager)' },
    { value: 'ADMIN', label: 'Admin' }
  ] as const;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
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
            this.passwordValidator.bind(this)
          ]
        ],
        confirmPassword: ['', Validators.required],

        // ✅ captcha control
        recaptcha: ['', Validators.required]
      },
      {
        validators: this.passwordMatchValidator.bind(this)
      }
    );
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '') as string;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    return hasUpperCase && hasLowerCase && hasNumber ? null : { weakPassword: true };
  }

  getPasswordStrength(): { level: 'weak' | 'fair' | 'good' | 'strong', score: number, label: string } {
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
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      longLength: password.length >= 12
    };

    if (checks.length) score += 15;
    if (checks.hasUpperCase) score += 15;
    if (checks.hasLowerCase) score += 15;
    if (checks.hasNumber) score += 15;
    if (checks.hasSpecialChar) score += 20;
    if (checks.longLength) score += 20;

    if (score < 30) {
      return { level: 'weak', score: Math.min(25, score), label: 'Faible' };
    } else if (score < 50) {
      return { level: 'fair', score: Math.min(50, score), label: 'Acceptable' };
    } else if (score < 75) {
      return { level: 'good', score: Math.min(75, score), label: 'Bon' };
    } else {
      return { level: 'strong', score: 100, label: 'Très fort' };
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
        firstName: 'Le prénom est obligatoire',
        lastName: 'Le nom est obligatoire',
        email: "L'adresse email est obligatoire",
        role: 'Veuillez sélectionner un rôle',
        password: 'Le mot de passe est obligatoire',
        confirmPassword: 'Veuillez confirmer votre mot de passe',
        recaptcha: 'Veuillez valider le captcha'
      };
      return messages[fieldName] || `${fieldLabel} est requis`;
    }

    if (field.hasError('minlength')) {
      const minLength = field.errors['minlength'].requiredLength;
      const messages: Record<string, string> = {
        firstName: `Le prénom doit contenir au moins ${minLength} caractères`,
        lastName: `Le nom doit contenir au moins ${minLength} caractères`,
        password: `Le mot de passe doit contenir au moins ${minLength} caractères`
      };
      return messages[fieldName] || `${fieldLabel} doit contenir au minimum ${minLength} caractères`;
    }

    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      const messages: Record<string, string> = {
        firstName: `Le prénom ne peut pas dépasser ${maxLength} caractères`,
        lastName: `Le nom ne peut pas dépasser ${maxLength} caractères`,
        password: `Le mot de passe ne peut pas dépasser ${maxLength} caractères`
      };
      return messages[fieldName] || `${fieldLabel} doit contenir au maximum ${maxLength} caractères`;
    }

    if (field.hasError('email')) {
      return 'Veuillez entrer une adresse email valide (ex: exemple@domaine.com)';
    }

    if (field.hasError('weakPassword')) {
      const password = field.value || '';
      const errors: string[] = [];

      if (!/[A-Z]/.test(password)) errors.push('une majuscule');
      if (!/[a-z]/.test(password)) errors.push('une minuscule');
      if (!/[0-9]/.test(password)) errors.push('un chiffre');

      return `Le mot de passe doit contenir au minimum: ${errors.join(', ')}`;
    }

    if (field.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas. Veuillez les vérifier';
    }

    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      role: 'Rôle',
      password: 'Mot de passe',
      confirmPassword: 'Confirmation du mot de passe',
      recaptcha: 'Captcha'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const roleValue = this.registerForm.value.role as UserType;

    const request: RegisterRequest = {
      firstName: this.registerForm.value.firstName!,
      lastName: this.registerForm.value.lastName!,
      email: this.registerForm.value.email!,
      password: this.registerForm.value.password!,
      phoneNumber: '00000000',
      userType: roleValue
    };

    // ✅ envoie aussi le captcha au backend (sans casser ton interface)
    const payload = { ...request, captchaToken: this.registerForm.value.recaptcha } as any;

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/registration-success']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Échec de l'inscription. L'email existe peut-être déjà.";
      }
    });
  }
}