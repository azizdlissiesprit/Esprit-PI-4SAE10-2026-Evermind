import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // <--- Import ActivatedRoute
import { AdminUserService } from '../../../../core/services/admin-user.service';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-add.html',
  styleUrls: ['./user-add.scss']
})
export class UserAddComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  isEditMode = false; // <--- Track mode
  userId: number | null = null;
  errorMessage = '';
  
  roles = ['ADMIN', 'MEDECIN', 'AIDANT', 'RESPONSABLE'];

  constructor(
    private fb: FormBuilder,
    private userService: AdminUserService,
    private router: Router,
    private route: ActivatedRoute // <--- Inject ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      userType: ['AIDANT', Validators.required],
      passwordHash: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Check if we have an ID in the URL
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUserData(this.userId);
      
      // In Edit mode, password is optional (only if they want to change it)
      this.userForm.get('passwordHash')?.clearValidators();
      this.userForm.get('passwordHash')?.updateValueAndValidity();
    }
  }

  loadUserData(id: number) {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        // Patch the form with existing data
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          userType: user.userType,
          passwordHash: '' // Leave password blank
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load user data';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const userData = this.userForm.value;

    // Decide whether to Create or Update
    const request$ = this.isEditMode 
      ? this.userService.updateUser(this.userId!, userData)
      : this.userService.addUser(userData);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'Operation failed. Email might exist.';
      }
    });
  }
}
