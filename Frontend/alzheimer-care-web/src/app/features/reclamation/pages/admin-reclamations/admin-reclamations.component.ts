import { Component } from '@angular/core';
import { ReclamationCenterComponent } from '../../components/reclamation-center/reclamation-center.component';

@Component({
  selector: 'app-admin-reclamations',
  standalone: true,
  imports: [ReclamationCenterComponent],
  template: `<app-reclamation-center mode="admin" view="list"></app-reclamation-center>`
})
export class AdminReclamationsComponent {}
