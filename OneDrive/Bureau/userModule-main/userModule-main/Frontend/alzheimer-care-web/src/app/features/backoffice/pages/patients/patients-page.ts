import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type PatientStatus = 'Actif' | 'Inactif';
type ScanType = 'IRM' | 'TEP' | 'EEG' | 'Scanner' | '—';

interface PatientRow {
  fullName: string;
  email: string;
  patientId: string;
  status: PatientStatus;
  lastScan: string;     // ex: "12 Oct 2023"
  lastScanType: ScanType;
  doctor: string;       // ex: "Dr. Thomas Bernard"
  createdAt: string;    // ex: "01 Sep 2023"
}

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patients-page.html',
  styleUrls: ['./patients-page.scss']
})
export class PatientsPageComponent {
  stats = [
    { label: 'Total Patients', value: '892' },
    { label: 'Patients Actifs', value: '821', sub: 'Stable' },
    { label: 'Nouveaux ce mois', value: '37', sub: '↑' },
    { label: 'Scans en attente', value: '42', sub: 'À assigner' }
  ];

  patients: PatientRow[] = [
    {
      fullName: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      patientId: 'P-10294',
      status: 'Actif',
      lastScan: '12 Oct 2023',
      lastScanType: 'IRM',
      doctor: 'Dr. Thomas Bernard',
      createdAt: '01 Sep 2023'
    },
    {
      fullName: 'Marie Lemaire',
      email: 'marie.lemaire@email.com',
      patientId: 'P-10401',
      status: 'Actif',
      lastScan: '05 Nov 2023',
      lastScanType: 'TEP',
      doctor: 'Dr. Claire Dubois',
      createdAt: '15 Oct 2023'
    },
    {
      fullName: 'Antoine Diop',
      email: 'antoine.diop@email.com',
      patientId: 'P-11022',
      status: 'Actif',
      lastScan: '—',
      lastScanType: '—',
      doctor: 'Non assigné',
      createdAt: '03 Dec 2023'
    },
    {
      fullName: 'Sonia Ben Ali',
      email: 'sonia.benali@email.com',
      patientId: 'P-09912',
      status: 'Inactif',
      lastScan: 'Il y a 2 mois',
      lastScanType: 'EEG',
      doctor: 'Dr. Thomas Bernard',
      createdAt: '05 Mar 2022'
    }
  ];

  onExport() {
    console.log('Export patients');
  }

  onNewPatient() {
    console.log('New patient');
  }
}