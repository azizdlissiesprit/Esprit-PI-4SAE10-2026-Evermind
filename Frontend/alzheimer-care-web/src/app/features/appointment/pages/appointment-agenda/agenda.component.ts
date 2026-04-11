import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda.component.html'
})
export class AgendaComponent {
  stats = [
    { label: 'RDV cette semaine', value: '47', trend: '+ 12% vs sem. préc.', trendClass: 'text-green-500' },
    { label: 'Taux de confirmation', value: '82%', trend: '+ 5pts', trendClass: 'text-green-500' },
    { label: 'Annulations', value: '4', trend: 'â 2 vs sem. préc.', trendClass: 'text-red-500' },
    { label: 'Durée moy. consultation', value: '23 min', trend: 'stable', trendClass: 'text-gray-500' }
  ];

  days = [
    { name: 'LUN', date: '31' },
    { name: 'MAR', date: '1' },
    { name: 'MER', date: '2', active: true },
    { name: 'JEU', date: '3' },
    { name: 'VEN', date: '4' }
  ];

  hours = ['08h', '09h', '10h', '11h', '12h', '13h'];

  appointments = [
    { day: 1, time: '08h30', name: 'Omar F.', type: 'Téléconsultation', color: 'bg-pink-100' },
    { day: 2, time: '08h00', name: 'Amira M.', type: 'Suivi par...', color: 'bg-green-100' },
    { day: 0, time: '10h00', name: 'Kamal H.', type: 'Téléconsultation', color: 'bg-pink-50' },
    { day: 3, time: '09h00', name: 'Fatma A.', type: 'Consultation', color: 'bg-blue-100' }
  ];
}
