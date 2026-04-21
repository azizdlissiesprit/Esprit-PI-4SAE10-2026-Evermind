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
  @Input() userData: any;
  @Input() sessionTime: string = '00:00:00';
}

