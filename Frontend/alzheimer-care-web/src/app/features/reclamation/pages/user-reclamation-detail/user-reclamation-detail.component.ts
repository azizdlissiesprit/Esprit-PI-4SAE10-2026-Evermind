import { Component } from '@angular/core';
import { ReclamationCenterComponent } from '../../components/reclamation-center/reclamation-center.component';

@Component({
  selector: 'app-user-reclamation-detail',
  standalone: true,
  imports: [ReclamationCenterComponent],
  template: `<app-reclamation-center mode="user" view="detail"></app-reclamation-center>`
})
export class UserReclamationDetailComponent {}
