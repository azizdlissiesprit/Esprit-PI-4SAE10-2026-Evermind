import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-appointment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; background: lightblue; margin: 20px;">
      <h1>Test Appointment Page</h1>
      <p>If you can see this, the route is working!</p>
      <p>Current time: {{ currentTime }}</p>
      <button (click)="onClick()">Test Button</button>
      <p *ngIf="clicked">Button was clicked!</p>
    </div>
  `,
  styles: [`
    h1 { color: blue; }
  `]
})
export class TestAppointmentComponent {
  currentTime = new Date().toLocaleString();
  clicked = false;

  constructor() {
    console.log('TestAppointmentComponent loaded!');
  }

  onClick() {
    this.clicked = true;
    console.log('Test button clicked!');
  }
}
