import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.scss']
})
export class AdminSidebarComponent {
  isCollapsed = false;

  menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-line', route: '/admin/dashboard' },
    { label: 'Users (Staff)', icon: 'fa-solid fa-user-doctor', route: '/admin/users' },
    { label: 'Patients', icon: 'fa-solid fa-hospital-user', route: '/admin/patients' },
    
    // 👇 NEW ITEMS ADDED HERE
    { label: 'Cognitive', icon: 'fa-solid fa-brain', route: '/admin/cognitive' },
    { label: 'Autonomy', icon: 'fa-solid fa-person-walking-with-cane', route: '/admin/autonomy' },
    
    // 👇 NEW STOCK ITEMS
    { label: 'Stock Dashboard', icon: 'fa-solid fa-boxes-stacked', route: '/admin/stock/dashboard' },
    { label: 'Categories', icon: 'fa-solid fa-tags', route: '/admin/stock/categories' },
    { label: 'Products', icon: 'fa-solid fa-box', route: '/admin/stock/produits' },
    { label: 'Orders', icon: 'fa-solid fa-cart-flatbed', route: '/admin/stock/commandes' },

    { label: 'Alerts', icon: 'fa-solid fa-triangle-exclamation', route: '/admin/alerts' },
    // { label: 'Interventions', icon: 'fa-solid fa-hand-holding-medical', route: '/admin/interventions' }, // Optional
    { label: 'Conversations', icon: 'fa-regular fa-comments', route: '/admin/conversations' },
    // { label: 'Rules & Logic', icon: 'fa-solid fa-microchip', route: '/admin/rules' }, // Optional
    // { label: 'System Logs', icon: 'fa-solid fa-file-code', route: '/admin/logs' }, // Optional
    { label: 'Settings', icon: 'fa-solid fa-sliders', route: '/admin/settings' },
  ];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}