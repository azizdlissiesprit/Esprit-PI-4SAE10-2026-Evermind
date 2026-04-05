import { Component, DestroyRef, Inject, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminUser } from '../../../core/models/admin-user.model';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-profile-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-container.html',
  styleUrl: './profile-container.scss'
})
export class ProfileContainerComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  currentUser: AdminUser | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }

    this.usersService
      .getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Impossible de charger le profil utilisateur.';
          this.isLoading = false;
        }
      });
  }

  get fullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
  }

  get initials(): string {
    if (!this.currentUser) return 'U';

    return `${this.currentUser.firstName?.charAt(0) || ''}${this.currentUser.lastName?.charAt(0) || ''}`
      .toUpperCase() || 'U';
  }

  get roleLabel(): string {
    const role = this.currentUser?.userType?.toString().toUpperCase() || '';

    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'AIDANT':
        return 'Aidant';
      case 'MEDECIN':
        return 'Medecin';
      case 'RESPONSABLE':
        return 'Responsable';
      default:
        return role || 'Utilisateur';
    }
  }

  get statusLabel(): string {
    if (!this.currentUser) return '';
    if (this.currentUser.banned) return 'Compte banni';
    if (!this.currentUser.active) return 'Compte non active';
    return 'Compte actif';
  }
}
