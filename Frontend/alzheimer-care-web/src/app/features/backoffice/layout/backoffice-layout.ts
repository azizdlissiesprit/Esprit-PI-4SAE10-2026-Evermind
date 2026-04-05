import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { ReclamationNotificationBellComponent } from '../../../core/components/reclamation-notification-bell/reclamation-notification-bell';
import { AdminUser } from '../../../core/models/admin-user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ReclamationNotificationCenterService } from '../../../core/services/reclamation-notification-center.service';
import { UsersService } from '../../../core/services/users.service';
import { Router } from '@angular/router';

interface BackofficeCurrentUser {
  name: string;
  role: string;
  initials: string;
}

@Component({
  selector: 'app-backoffice-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReclamationNotificationBellComponent],
  templateUrl: './backoffice-layout.html',
  styleUrls: ['./backoffice-layout.scss']
})
export class BackofficeLayoutComponent {
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationCenter = inject(ReclamationNotificationCenterService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentUser: BackofficeCurrentUser = {
    name: 'Chargement...',
    role: 'Connexion en cours',
    initials: '...'
  };

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.notificationCenter.start();
      this.loadCurrentUser();
    }
  }

  private loadCurrentUser(): void {
    this.usersService
      .getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.currentUser = this.mapCurrentUser(user);
        },
        error: () => {
          this.currentUser = {
            name: 'Utilisateur',
            role: 'Session inconnue',
            initials: 'U'
          };
        }
      });
  }

  private mapCurrentUser(user: AdminUser): BackofficeCurrentUser {
    const firstName = user.firstName?.trim() || '';
    const lastName = user.lastName?.trim() || '';
    const fallbackName = user.email?.trim() || 'Utilisateur';
    const fullName = `${firstName} ${lastName}`.trim() || fallbackName;

    return {
      name: fullName,
      role: this.mapRoleLabel(user.userType),
      initials: this.buildInitials(firstName, lastName, fallbackName)
    };
  }

  private mapRoleLabel(role: string | null): string {
    switch ((role || '').toUpperCase()) {
      case 'ADMIN':
      case 'ROLE_ADMIN':
        return 'Administrateur';
      case 'AIDANT':
      case 'ROLE_AIDANT':
        return 'Aidant';
      case 'MEDECIN':
      case 'ROLE_MEDECIN':
        return 'Medecin';
      case 'RESPONSABLE':
      case 'ROLE_RESPONSABLE':
        return 'Responsable';
      default:
        return role || 'Utilisateur connecte';
    }
  }

  private buildInitials(firstName: string, lastName: string, fallbackName: string): string {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase();
    if (initials) return initials;
    return fallbackName.charAt(0).toUpperCase() || 'U';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
