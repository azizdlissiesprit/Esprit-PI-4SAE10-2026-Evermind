import { Component } from '@angular/core';
import { ReclamationCenterComponent } from '../../components/reclamation-center/reclamation-center.component';

@Component({
  selector: 'app-user-reclamations',
  standalone: true,
  imports: [ReclamationCenterComponent],
  template: `<app-reclamation-center mode="user" view="list"></app-reclamation-center>`
})
export class UserReclamationsComponent {}
