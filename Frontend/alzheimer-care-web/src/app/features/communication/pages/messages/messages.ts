import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunicationService } from '../../../../core/services/communication.service';
import { Conversation, Message, SendMessageDTO, UserDTO } from '../../../../core/models/communication.models';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.html',
  styleUrls: ['./messages.scss']
})
export class MessagesComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatBody') private chatBody!: ElementRef;

  conversations: Conversation[] = [];
  availableUsers: UserDTO[] = [];
  messages: Message[] = [];
  activeConversation?: Conversation;
  newMessageContent: string = '';
  currentUserId: number = 0;
  
  loadingConversations = false;
  loadingMessages = false;
  loadingUsers = false;
  
  activeTab: 'conversations' | 'users' = 'conversations';

  constructor(private communicationService: CommunicationService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        this.currentUserId = parseInt(storedUserId, 10);
        this.loadConversations();
        this.loadAvailableUsers();
      } else {
        console.warn('No user_id found in localStorage');
      }
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadConversations(): void {
    this.loadingConversations = true;
    this.communicationService.getConversationsByUser(this.currentUserId).subscribe({
      next: (data) => {
        this.conversations = data;
        this.loadingConversations = false;
        if (this.conversations.length > 0 && !this.activeConversation) {
          this.selectConversation(this.conversations[0]);
        }
      },
      error: (err) => {
        console.error('Error loading conversations', err);
        this.loadingConversations = false;
      }
    });
  }

  loadAvailableUsers(): void {
    this.loadingUsers = true;
    this.communicationService.getAvailableUsers().subscribe({
      next: (data) => {
        // Filter out the current user
        this.availableUsers = data.filter(u => u.userId !== this.currentUserId);
        this.loadingUsers = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.loadingUsers = false;
      }
    });
  }

  selectConversation(conv: Conversation): void {
    this.activeConversation = conv;
    this.activeTab = 'conversations';
    this.loadMessages(conv.id);
    this.communicationService.markAsRead(conv.id, this.currentUserId).subscribe();
  }

  startNewConversation(user: UserDTO): void {
    // Check if a conversation already exists with this user
    const existing = this.conversations.find(c => c.otherParticipant.userId === user.userId);
    if (existing) {
      this.selectConversation(existing);
    } else {
      // Create a temporary conversation object to show in UI
      // The actual creation happens on the backend when the first message is sent
      this.activeConversation = {
        id: 0, // 0 indicates it's a new conversation thread
        otherParticipant: user,
        lastUpdated: new Date().toISOString(),
        lastMessagePreview: 'New Conversation'
      };
      this.messages = [];
      this.activeTab = 'conversations';
    }
  }

  loadMessages(conversationId: number): void {
    if (conversationId === 0) {
      this.messages = [];
      return;
    }
    this.loadingMessages = true;
    this.communicationService.getMessagesByConversation(conversationId).subscribe({
      next: (data) => {
        this.messages = data;
        this.loadingMessages = false;
      },
      error: (err) => {
        console.error('Error loading messages', err);
        this.loadingMessages = false;
      }
    });
  }

  onSendMessage(): void {
    if (!this.newMessageContent.trim() || !this.activeConversation) return;

    const dto: SendMessageDTO = {
      senderId: this.currentUserId,
      receiverId: this.activeConversation.otherParticipant.userId,
      content: this.newMessageContent
    };

    this.communicationService.sendMessage(dto).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessageContent = '';
        
        // If it was a new conversation, we need to refresh the list to get the real ID
        if (this.activeConversation?.id === 0) {
          this.loadConversations();
          // After refresh, the backend will have created the conversation
        } else {
          this.activeConversation!.lastMessagePreview = msg.content;
          this.activeConversation!.lastUpdated = msg.timestamp || new Date().toISOString();
        }
      },
      error: (err) => {
        console.error('Error sending message', err);
      }
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
