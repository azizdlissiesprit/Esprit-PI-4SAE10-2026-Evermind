import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-list.html',
  styleUrls: ['./alert-list.scss']
})
export class AlertListComponent {
  // In the future, you will fetch alerts from your API here
}