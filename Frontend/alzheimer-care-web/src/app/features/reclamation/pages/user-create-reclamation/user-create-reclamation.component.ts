import { Component } from '@angular/core';
import { ReclamationCenterComponent } from '../../components/reclamation-center/reclamation-center.component';

@Component({
  selector: 'app-user-create-reclamation',
  standalone: true,
  imports: [ReclamationCenterComponent],
  template: `<app-reclamation-center mode="user" view="create"></app-reclamation-center>`
})
export class UserCreateReclamationComponent {}
