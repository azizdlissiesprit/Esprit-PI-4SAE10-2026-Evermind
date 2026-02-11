import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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

  constructor(private fb: FormBuilder, private router: Router) {
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

    // Check if passwords match
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    this.isLoading = true;
    console.log('Registration Data:', this.registerForm.value);

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/auth/login']); // Redirect to login after success
    }, 1500);
  }
}