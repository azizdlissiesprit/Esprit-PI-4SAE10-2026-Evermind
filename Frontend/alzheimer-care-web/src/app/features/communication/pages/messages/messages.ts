import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.html',
  styleUrls: ['./messages.scss']
})
export class MessagesComponent {
  // Logic for selecting conversations can go here later
  activeConversationId = 1; 
}