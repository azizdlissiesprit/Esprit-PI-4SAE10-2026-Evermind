import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, finalize } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminUser, UserFilters, UserStats } from '../../../../core/models/admin-user.model';
import { UserType } from '../../../../core/models/enums';
import { UsersService } from '../../../../core/services/users.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'BANNED' | 'INACTIVE';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-page.html',
  styleUrls: ['./users-page.scss']
})
export class UsersPageComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$ = new Subject<string>();

  readonly roleOptions: Array<{ value: UserType | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'Tous les roles' },
    { value: UserType.ADMIN, label: 'Admin' },
    { value: UserType.AIDANT, label: 'Aidant' },
    { value: UserType.MEDECIN, label: 'Medecin' },
    { value: UserType.RESPONSABLE, label: 'Responsable' }
  ];

  readonly statusOptions: Array<{ value: StatusFilter; label: string }> = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: 'ACTIVE', label: 'Actifs' },
    { value: 'BANNED', label: 'Bannis' },
    { value: 'INACTIVE', label: 'Non actives' }
  ];

  readonly emptyStats: UserStats = {
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    admins: 0,
    aidants: 0,
    medecins: 0,
    responsables: 0
  };

  readonly userType = UserType;

  stats: UserStats = this.emptyStats;
  users: AdminUser[] = [];

  searchTerm = '';
  selectedRole: UserType | 'ALL' = 'ALL';
  selectedStatus: StatusFilter = 'ALL';
  currentPage = 1;
  readonly pageSize = 8;

  isLoading = true;
  isRefreshingUsers = false;
  errorMessage = '';
  activeActionUserId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadUsers());
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPage();
    } else {
      this.isLoading = false;
    }
  }

  get statCards(): Array<{ label: string; value: number; sub?: string }> {
    return [
      { label: 'Total Utilisateurs', value: this.stats.totalUsers },
      { label: 'Utilisateurs Actifs', value: this.stats.activeUsers, sub: 'Comptes actifs' },
      { label: 'Utilisateurs Bannis', value: this.stats.bannedUsers, sub: 'Acces restreint' },
      {
        label: 'Admins / Aidants / Medecins',
        value: this.stats.admins,
        sub: `${this.stats.aidants} aidants, ${this.stats.medecins} medecins`
      }
    ];
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.users.length / this.pageSize));
  }

  get pagedUsers(): AdminUser[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get paginationLabel(): string {
    if (!this.users.length) {
      return '0 resultat';
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.users.length);
    return `${start}-${end} sur ${this.users.length}`;
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.search$.next(value);
  }

  onRoleChange(value: UserType | 'ALL'): void {
    this.selectedRole = value;
    this.loadUsers();
  }

  onStatusChange(value: StatusFilter): void {
    this.selectedStatus = value;
    this.loadUsers();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = 'ALL';
    this.selectedStatus = 'ALL';
    this.loadUsers();
  }

  refresh(): void {
    this.loadPage();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
  }

  toggleBan(user: AdminUser): void {
    const action$ = user.banned
      ? this.usersService.unbanUser(user.userId)
      : this.usersService.banUser(user.userId);

    this.activeActionUserId = user.userId;
    action$
      .pipe(finalize(() => (this.activeActionUserId = null)))
      .subscribe({
        next: (updatedUser) => {
          this.users = this.users.map((current) =>
            current.userId === updatedUser.userId ? updatedUser : current
          );
          this.users = this.applyStatusFilter(this.users);
          this.clampCurrentPage();
          this.loadStats();
        },
        error: () => {
          this.errorMessage = 'Impossible de mettre a jour le statut de cet utilisateur.';
        }
      });
  }

  deleteUser(user: AdminUser): void {
    const confirmed = window.confirm(
      `Supprimer ${this.getFullName(user)} (${user.email}) ? Cette action est irreversible.`
    );

    if (!confirmed) return;

    this.activeActionUserId = user.userId;
    this.usersService
      .deleteUser(user.userId)
      .pipe(finalize(() => (this.activeActionUserId = null)))
      .subscribe({
        next: () => {
          this.users = this.users.filter((current) => current.userId !== user.userId);
          this.clampCurrentPage();
          this.loadStats();
        },
        error: () => {
          this.errorMessage = 'La suppression a echoue.';
        }
      });
  }

  exportUsers(): void {
    if (!this.users.length) return;

    const header = ['userId', 'firstName', 'lastName', 'email', 'phoneNumber', 'userType', 'active', 'banned'];
    const lines = this.users.map((user) =>
      [
        user.userId,
        user.firstName,
        user.lastName,
        user.email,
        user.phoneNumber,
        user.userType,
        user.active,
        user.banned
      ]
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );

    const blob = new Blob([[header.join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'users-export.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  getFullName(user: AdminUser): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  getInitials(user: AdminUser): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getRoleLabel(userType: UserType): string {
    switch (userType) {
      case UserType.ADMIN:
        return 'Admin';
      case UserType.AIDANT:
        return 'Aidant';
      case UserType.MEDECIN:
        return 'Medecin';
      case UserType.RESPONSABLE:
        return 'Responsable';
      default:
        return userType;
    }
  }

  getStatusLabel(user: AdminUser): string {
    if (user.banned) return 'Banni';
    if (!user.active) return 'Non active';
    return 'Actif';
  }

  getActionLabel(user: AdminUser): string {
    return user.banned ? 'Unban' : 'Ban';
  }

  formatLastActivity(user: AdminUser): string {
    if (!user.lastLogin) return 'Jamais connecte';
    return new Date(user.lastLogin).toLocaleString();
  }

  private loadPage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.loadUsers(true);
    this.loadStats();
  }

  private loadUsers(isInitialLoad = false): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (isInitialLoad) {
      this.isLoading = true;
    } else {
      this.isRefreshingUsers = true;
    }

    this.errorMessage = '';

    this.usersService
      .getUsers(this.buildFilters())
      .pipe(
        finalize(() => {
          if (isInitialLoad) {
            this.isLoading = false;
          } else {
            this.isRefreshingUsers = false;
          }
        })
      )
      .subscribe({
        next: (users) => {
          this.users = this.applyStatusFilter(users);
          this.clampCurrentPage();
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(error);
          this.users = [];
          this.currentPage = 1;
        }
      });
  }

  private loadStats(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.usersService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: () => {
        this.stats = this.emptyStats;
      }
    });
  }

  private buildFilters(): UserFilters {
    return {
      search: this.searchTerm || undefined,
      userType: this.selectedRole === 'ALL' ? undefined : this.selectedRole
    };
  }

  private applyStatusFilter(users: AdminUser[]): AdminUser[] {
    switch (this.selectedStatus) {
      case 'ACTIVE':
        return users.filter((user) => user.active && !user.banned);
      case 'BANNED':
        return users.filter((user) => user.banned);
      case 'INACTIVE':
        return users.filter((user) => !user.active && !user.banned);
      default:
        return users;
    }
  }

  private clampCurrentPage(): void {
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));
  }

  private getErrorMessage(error: unknown): string {
    const status = (error as { status?: number })?.status;

    if (status === 403) {
      return 'Acces refuse. Connectez-vous avec un compte admin.';
    }

    return 'Impossible de charger les utilisateurs depuis le backend.';
  }
}
