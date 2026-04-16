import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/auth.models';

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
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmMotDePasse: ['', Validators.required],
      role: ['AIDANT']
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    if (this.registerForm.value.motDePasse !== this.registerForm.value.confirmMotDePasse) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Build payload matching Formation backend SignUpDTO exactly
    const request: RegisterRequest = {
      nom: this.registerForm.value.nom,
      prenom: this.registerForm.value.prenom,
      email: this.registerForm.value.email,
      motDePasse: this.registerForm.value.motDePasse,
      confirmMotDePasse: this.registerForm.value.confirmMotDePasse,
      role: this.registerForm.value.role || 'AIDANT'
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
        this.errorMessage = error?.error?.error || "Échec de l'inscription. Email déjà utilisé.";
      }
    });
  }
}