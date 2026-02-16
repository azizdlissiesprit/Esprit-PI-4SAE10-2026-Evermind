import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-relative-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relative-profile.html',
  styleUrls: ['./relative-profile.scss']
})
export class RelativeProfileComponent {
  @Input() userData: any = {
    firstName: 'Michael',
    lastName: 'Corleone',
    role: 'Family Guardian & Legal Proxy',
    relation: 'Son of patient: Vito Corleone',
    phone: '+1 (555) 201-9034',
    email: 'michael.corleone@example.com',
    address: '1200 Evergreen Terrace, New York, NY',
    legalStatus: 'Power of Attorney (Medical)'
  };

  // Mock data for documents
  documents = [
    { title: 'Advance directives', date: '03 Jan 2024', icon: 'fa-regular fa-file-lines' },
    { title: 'DNR orders', date: '18 Feb 2024', icon: 'fa-solid fa-heart-pulse' },
    { title: 'Power of Attorney', date: '10 Mar 2024', icon: 'fa-solid fa-shield-halved' }
  ];

  // Mock data for guests
  guests = [
    { name: 'Connie Corleone', role: 'Sister • View-only', img: 'https://i.pravatar.cc/150?img=44' },
    { name: 'Sonny Corleone', role: 'Backup contact', img: 'https://i.pravatar.cc/150?img=11' }
  ];
}