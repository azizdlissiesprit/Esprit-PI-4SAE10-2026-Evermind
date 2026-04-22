import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef  } from '@angular/core'; // <--- Import Inject & PLATFORM_ID
import { CommonModule, isPlatformBrowser } from '@angular/common'; // <--- Import isPlatformBrowser
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RouterModule, Router } from '@angular/router'; 

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent implements OnInit {
  
  users: any[] = [];
  loading = false;
  // ... other vars ...
  
  currentPage = 0;
  pageSize = 10;
  searchTerm = '';
  selectedRole = 'ALL';
  sortColumn = 'createdAt';
  sortDirection = 'desc';
totalElements = 0;
  totalPages = 0; 
  private searchSubject = new Subject<string>();

  constructor(
    private adminUserService: AdminUserService,
    private cd: ChangeDetectorRef,
    private router: Router, // <--- 2. Inject it here
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 0;
      this.loadUsers();
    });
  }

  ngOnInit() {
    console.log("1. OnInit Started"); // <--- LOG 1

    if (isPlatformBrowser(this.platformId)) {
        console.log("2. Browser Detected - Calling loadUsers()"); // <--- LOG 2
        this.loadUsers();
    } else {
        console.log("2. Server Detected - Skipping loadUsers()"); // <--- LOG 2
    }
  }
    // --- PAGINATION ---
  onPageChange(page: number) {
    // Prevent going below 0 or above total pages
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }
   onDelete(id: number) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.adminUserService.deleteUser(id).subscribe({
        next: () => {
          // Remove locally to avoid full reload
          this.users = this.users.filter(u => u.userId !== id);
          this.totalElements--;
          this.cd.detectChanges();
        },
        error: (err: any) => alert('Failed to delete user.')
      });
    }
  }

  // EDIT
  onEdit(id: number) {
    // Navigate to the reused form with the ID
    this.router.navigate(['/admin/users/edit', id]);
  }


  // --- SORTING ---
  onSort(column: string) {
    if (this.sortColumn === column) {
      // Toggle direction if clicking the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadUsers();
  }

  // --- FILTERS ---
  onSearch(event: any) {
    this.searchSubject.next(event.target.value);
  }

  onRoleChange() {
    this.currentPage = 0; // Reset to first page when filter changes
    this.loadUsers();
  }

  // --- ACTIONS ---


  // --- UI HELPERS ---
  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'badge-purple';
      case 'MEDECIN': return 'badge-blue';
      case 'AIDANT': return 'badge-green';
      default: return 'badge-gray';
    }
  }

  loadUsers() {
    console.log("3. loadUsers() called");
    this.loading = true;

    this.adminUserService.getUsers(
      this.currentPage, 
      this.pageSize, 
      this.searchTerm, 
      this.selectedRole,
      this.sortColumn,
      this.sortDirection
    ).subscribe({
      next: (data: any) => {
        console.log("4. SUCCESS - Data Received:", data);
        
        this.users = data.content || [];
        this.totalElements = data.totalElements || 0;
        this.totalPages = data.totalPages || 0;

        this.loading = false;
        this.cd.detectChanges(); // <--- 3. FORCE UI UPDATE
      },
      error: (err: any) => {
        console.error("4. ERROR - API Failed:", err);
        this.loading = false;
        this.cd.detectChanges(); // <--- 3. FORCE UI UPDATE
      },
      complete: () => {
        console.log("5. Subscription Complete");
      }
    });
  }
}
