import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EmailLogService } from '../../../../core/services/email-log.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.scss']
})
export class AdminSidebarComponent implements OnInit {
  isCollapsed = false;
  stockGroupExpanded = false;
  unreadEmailsCount = 0;

  menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-line', route: '/admin/dashboard' },
    { label: 'Users (Staff)', icon: 'fa-solid fa-user-doctor', route: '/admin/users' },
    { label: 'Patients', icon: 'fa-solid fa-hospital-user', route: '/admin/patients' },
    { label: 'Assign Patients', icon: 'fa-solid fa-user-plus', route: '/admin/assign-patients' },
    
    // 👇 NEW ITEMS ADDED HERE
    { label: 'Cognitive', icon: 'fa-solid fa-brain', route: '/admin/cognitive' },
    { label: 'Autonomy', icon: 'fa-solid fa-person-walking-with-cane', route: '/admin/autonomy' },

    { label: 'Alerts', icon: 'fa-solid fa-triangle-exclamation', route: '/admin/alerts' },
    { label: 'Conversations', icon: 'fa-regular fa-comments', route: '/admin/conversations' },
    { label: 'Platform Seeding', icon: 'fa-solid fa-database', route: '/admin/data-seeding' },
    { label: 'Settings', icon: 'fa-solid fa-sliders', route: '/admin/settings' },
  ];

  stockItems = [
    { label: 'Stock Dashboard', icon: 'fa-solid fa-boxes-stacked', route: '/admin/stock/dashboard' },
    { label: 'Categories', icon: 'fa-solid fa-tags', route: '/admin/stock/categories' },
    { label: 'Products', icon: 'fa-solid fa-box', route: '/admin/stock/produits' },
    { label: 'Orders', icon: 'fa-solid fa-cart-flatbed', route: '/admin/stock/commandes' },
    { label: 'Stock Analysis', icon: 'fa-solid fa-chart-pie', route: '/admin/stock/analyse' },
    { label: 'AI Insights', icon: 'fa-solid fa-chart-line', route: '/admin/stock/analytics' },
    { label: 'Email Logs', icon: 'fa-solid fa-envelope', route: '/admin/stock/emails', hasBadge: true },
  ];

  constructor(private router: Router, private emailLogService: EmailLogService) {}

  ngOnInit() {
    this.checkCurrentRoute();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkCurrentRoute();
    });

    this.chargerUnreadEmails();
  }

  chargerUnreadEmails() {
    this.emailLogService.compterNonLus().subscribe({
      next: (res) => this.unreadEmailsCount = res.count,
      error: () => console.error("Could not load unread emails count")
    });
  }

  checkCurrentRoute() {
    if (this.router.url.includes('/admin/stock')) {
      this.stockGroupExpanded = true;
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleStockGroup() {
    if (!this.isCollapsed) {
      this.stockGroupExpanded = !this.stockGroupExpanded;
    } else {
      this.isCollapsed = false;
      this.stockGroupExpanded = true;
    }
  }
}