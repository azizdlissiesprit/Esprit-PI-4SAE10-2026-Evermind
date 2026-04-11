import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  
  // Statistiques du haut
  stats = [
    { label: 'RDV cette semaine', value: '47', trend: '12% vs sem. préc.', trendType: 'up' },
    { label: 'Taux de confirmation', value: '82%', trend: '5pts', trendType: 'up' },
    { label: 'Annulations', value: '4', trend: '2 vs sem. préc.', trendType: 'down' },
    { label: 'Durée moy. consultation', value: '23 min', trend: 'stable', trendType: 'neutral' }
  ];

  // Configuration du calendrier
  days = [
    { name: 'LUN', date: '31' },
    { name: 'MAR', date: '1' },
    { name: 'MER', date: '2', active: true },
    { name: 'JEU', date: '3' },
    { name: 'VEN', date: '4' }
  ];

  hours = ['08h', '09h', '10h', '11h', '12h', '13h'];

  // Données simulées pour le calendrier
  appointments = [
    { day: 'MAR', hour: '08h', name: 'Omar E.', type: 'Téléconsult', color: 'bg-pink-100 border-pink-300' },
    { day: 'MAR', hour: '09h', name: 'Leila D.', type: '1ère visite', color: 'bg-red-50 border-red-200' },
    { day: 'MAR', hour: '11h', name: 'Sami M.', type: 'Suivi cap.', color: 'bg-purple-100 border-purple-300' },
    { day: 'MAR', hour: '12h', name: 'Nadia B.', type: 'Suivi auto.', color: 'bg-green-100 border-green-300' },
    { day: 'MER', hour: '08h', name: 'Amira M.', type: 'Suivi cap.', color: 'bg-green-100 border-green-300' },
    { day: 'MER', hour: '10h', name: 'K. Haddad', type: 'Bilan mé.', color: 'bg-yellow-100 border-yellow-300' },
    { day: 'JEU', hour: '09h', name: 'Salma A.', type: 'Consultat.', color: 'bg-blue-100 border-blue-300' },
    { day: 'JEU', hour: '12h', name: 'Ali D.', type: 'Téléconsult', color: 'bg-pink-100 border-pink-300' },
  ];

  constructor() { }

  ngOnInit(): void { }

  getAppointment(day: string, hour: string) {
    return this.appointments.find(a => a.day === day && a.hour === hour);
  }
}
