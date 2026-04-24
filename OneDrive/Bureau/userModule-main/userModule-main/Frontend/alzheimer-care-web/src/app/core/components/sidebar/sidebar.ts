import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { ReclamationNotificationBellComponent } from '../reclamation-notification-bell/reclamation-notification-bell';
import { ReclamationNotificationCenterService } from '../../services/reclamation-notification-center.service';
import { UsersService } from '../../services/users.service';
import { AdminUser } from '../../models/admin-user.model';
import { getRoleReclamationsRoute, getUserAreaBase, normalizeRole } from '../../utils/role-routing';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReclamationNotificationBellComponent],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly notificationCenter = inject(ReclamationNotificationCenterService);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);

  currentUser: any = null;
  isCollapsed = false;
  menuItems: Array<{ label: string; icon: string; route: string }> = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.mapCurrentUser(this.authService.getCurrentUser());
    this.menuItems = this.buildMenuItems();
    this.notificationCenter.start();
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.notificationCenter.close();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private loadCurrentUser(): void {
    this.usersService
      .getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.currentUser = this.mapCurrentUser(user);
        }
      });
  }

  private mapCurrentUser(user: Partial<AdminUser> | null): { firstName: string; lastName: string; role: string } | null {
    if (!user) return null;

    return {
      firstName: user.firstName?.trim() || '',
      lastName: user.lastName?.trim() || '',
      role: this.mapRoleLabel(user.userType?.toString() || (user as { role?: string }).role || '')
    };
  }

  private mapRoleLabel(role: string): string {
    switch (role.toUpperCase()) {
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
        return role || 'Utilisateur';
    }
  }

  private buildMenuItems(): Array<{ label: string; icon: string; route: string }> {
    const currentRole = normalizeRole(this.authService.getRole());
    const base = getUserAreaBase(currentRole);

    return [
      { label: this.getProfileLabel(), icon: 'fa-solid fa-id-card', route: `${base}/profile` },
      {
        label: 'Reclamations',
        icon: 'fa-solid fa-file-lines',
        route: getRoleReclamationsRoute(currentRole)
      }
    ];
  }

  private getProfileLabel(): string {
    switch (normalizeRole(this.authService.getRole())) {
      case 'AIDANT':
        return 'Profil aidant';
      case 'MEDECIN':
        return 'Profil medecin';
      case 'RESPONSABLE':
        return 'Profil responsable';
      default:
        return 'Mon profil';
    }
  }
}
