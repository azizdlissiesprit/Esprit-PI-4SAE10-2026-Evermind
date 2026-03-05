import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  

  isCollapsed = false;
  menuItems = [
    { label: 'Home', icon: 'fa-solid fa-table-columns', route: '/app/dashboard' },
    { label: 'Patients', icon: 'fa-regular fa-user', route: '/app/patients' },
    { label: 'Guardians', icon: 'fa-solid fa-users-viewfinder', route: '/app/guardians' },
    { label: 'Alerts', icon: 'fa-solid fa-triangle-exclamation', route: '/app/alerts' },
    { label: 'Messages', icon: 'fa-regular fa-comment-dots', route: '/app/messages' },
    
    // 👇 NEW STOCK ITEMS
    { label: 'Store', icon: 'fa-solid fa-shop', route: '/app/store' },
    { label: 'Cart', icon: 'fa-solid fa-cart-shopping', route: '/app/store/panier' },

    { label: 'Settings', icon: 'fa-solid fa-gear', route: '/app/settings' },
    { label: 'Profile', icon: 'fa-solid fa-id-card', route: '/app/profile' } // Added Profile link
  ];
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Optional: Toggle logic for mobile could go here
}