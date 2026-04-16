import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-formation-container',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './formation-container.html',
  styleUrls: ['./formation-container.scss']
})
export class FormationContainerComponent {}
