import { Component, signal, computed, inject, ElementRef, ViewChild, AfterViewChecked, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatbotResponse } from '../../../core/services/chatbot.service';
import { AuthService } from '../../../core/services/auth.service';

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sql?: string | null;
  database?: string | null;
  isError?: boolean;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Action Button -->
    <button
      class="chatbot-fab"
      [class.open]="isOpen()"
      (click)="toggle()"
      [attr.aria-label]="isOpen() ? 'Close chatbot' : 'Open chatbot'">
      <span class="fab-icon">
        @if (!isOpen()) {
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7l-3 3.5L9 16c-2-1.5-4-4-4-7a7 7 0 0 1 7-7z"/>
            <circle cx="12" cy="9" r="1.5"/>
            <path d="M8.5 9a3.5 3.5 0 0 1 7 0"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
          </svg>
        } @else {
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        }
      </span>
      <span class="fab-pulse"></span>
    </button>

    <!-- Chat Panel -->
    @if (isOpen()) {
      <div class="chatbot-panel">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-left">
            <div class="header-avatar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7l-3 3.5L9 16c-2-1.5-4-4-4-7a7 7 0 0 1 7-7z"/>
                <circle cx="12" cy="9" r="1.5"/>
                <path d="M8.5 9a3.5 3.5 0 0 1 7 0"/>
              </svg>
            </div>
            <div class="header-info">
              <h4>EverMind AI</h4>
              <span class="status-dot">
                <span class="dot"></span>
                Online
              </span>
            </div>
          </div>
          <div class="header-actions-bar">
            @if (messages().length > 0) {
              <button class="header-btn" (click)="clearChat()" title="Clear conversation">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            }
            <button class="header-btn" (click)="toggle()" title="Close">
              <i class="fa-solid fa-minus"></i>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" #messageContainer>
          @if (messages().length === 0 && !isLoading()) {
            <div class="welcome-state">
              <div class="welcome-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7l-3 3.5L9 16c-2-1.5-4-4-4-7a7 7 0 0 1 7-7z"/>
                  <circle cx="12" cy="9" r="1.5"/>
                  <path d="M8.5 9a3.5 3.5 0 0 1 7 0"/>
                  <line x1="9" y1="13" x2="15" y2="13"/>
                </svg>
              </div>
              <h3>EverMind AI Assistant</h3>
              <p>Ask me anything about your patients, alerts, interventions, and more.</p>
              <div class="suggestion-chips">
                <button class="chip" (click)="sendSuggestion('How many patients do we have?')">
                  <i class="fa-solid fa-user-group"></i> Patient count
                </button>
                <button class="chip" (click)="sendSuggestion('Show me the latest critical alerts')">
                  <i class="fa-solid fa-bell"></i> Critical alerts
                </button>
                <button class="chip" (click)="sendSuggestion('Which sensors are active?')">
                  <i class="fa-solid fa-microchip"></i> Active sensors
                </button>
                <button class="chip" (click)="sendSuggestion('List all doctors')">
                  <i class="fa-solid fa-user-doctor"></i> All doctors
                </button>
              </div>
            </div>
          }

          @for (msg of messages(); track msg.id) {
            <div class="message-row" [class.user]="msg.role === 'user'" [class.bot]="msg.role === 'bot'">
              @if (msg.role === 'bot') {
                <div class="msg-avatar bot-avatar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7l-3 3.5L9 16c-2-1.5-4-4-4-7a7 7 0 0 1 7-7z"/>
                    <circle cx="12" cy="9" r="1.5"/>
                  </svg>
                </div>
              }
              <div class="msg-bubble" [class.error]="msg.isError">
                <div class="msg-text">{{ msg.content }}</div>
                @if (msg.role === 'bot' && msg.database) {
                  <div class="msg-meta">
                    <span class="db-badge">
                      <i class="fa-solid fa-database"></i> {{ msg.database }}
                    </span>
                  </div>
                }
              </div>
            </div>
          }

          @if (isLoading()) {
            <div class="message-row bot">
              <div class="msg-avatar bot-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7l-3 3.5L9 16c-2-1.5-4-4-4-7a7 7 0 0 1 7-7z"/>
                  <circle cx="12" cy="9" r="1.5"/>
                </svg>
              </div>
              <div class="msg-bubble typing-bubble">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Input -->
        <div class="chat-input-area">
          <div class="input-wrapper">
            <input
              type="text"
              [(ngModel)]="inputText"
              (keydown.enter)="send()"
              placeholder="Ask about patients, alerts, sensors..."
              [disabled]="isLoading()"
              #chatInput />
            <button
              class="send-btn"
              (click)="send()"
              [disabled]="!inputText.trim() || isLoading()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <span class="input-hint">Powered by Gemini AI · Read-only queries</span>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ==================== FLOATING ACTION BUTTON ==================== */
    .chatbot-fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 10000;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white;
      box-shadow:
        0 8px 32px rgba(99, 102, 241, 0.4),
        0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .chatbot-fab:hover {
      transform: scale(1.08);
      box-shadow:
        0 12px 40px rgba(99, 102, 241, 0.5),
        0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .chatbot-fab:active { transform: scale(0.95); }

    .chatbot-fab.open {
      background: linear-gradient(135deg, #4B5563, #374151);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .fab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s;
    }

    .chatbot-fab.open .fab-icon { transform: rotate(90deg); }

    .fab-pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      animation: fabPulse 2.5s ease-out infinite;
      z-index: -1;
    }

    .chatbot-fab.open .fab-pulse { animation: none; opacity: 0; }

    @keyframes fabPulse {
      0% { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    /* ==================== CHAT PANEL ==================== */
    .chatbot-panel {
      position: fixed;
      bottom: 100px;
      right: 28px;
      z-index: 9999;
      width: 420px;
      max-height: 600px;
      background: var(--bg-card, #ffffff);
      border-radius: 24px;
      box-shadow:
        0 25px 60px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: panelSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes panelSlideIn {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* ==================== HEADER ==================== */
    .chat-header {
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      padding: 18px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-info h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.2px;
    }

    .status-dot {
      font-size: 11px;
      font-weight: 500;
      opacity: 0.85;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #34D399;
      display: inline-block;
      box-shadow: 0 0 6px rgba(52, 211, 153, 0.6);
      animation: dotPulse 2s ease-in-out infinite;
    }

    @keyframes dotPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .header-actions-bar {
      display: flex;
      gap: 6px;
    }

    .header-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.15);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      transition: background 0.2s;
    }

    .header-btn:hover { background: rgba(255, 255, 255, 0.25); }

    /* ==================== MESSAGES AREA ==================== */
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      min-height: 320px;
      max-height: 380px;
      background: var(--bg-main, #F8FAFC);
      scroll-behavior: smooth;
    }

    .chat-messages::-webkit-scrollbar { width: 5px; }
    .chat-messages::-webkit-scrollbar-track { background: transparent; }
    .chat-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }

    /* ==================== WELCOME STATE ==================== */
    .welcome-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 20px 10px;
      flex: 1;
    }

    .welcome-icon {
      width: 80px;
      height: 80px;
      border-radius: 24px;
      background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1));
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      color: #6366F1;
    }

    .welcome-state h3 {
      margin: 0 0 6px 0;
      font-size: 17px;
      font-weight: 800;
      color: var(--text-primary, #1E293B);
      letter-spacing: -0.3px;
    }

    .welcome-state p {
      margin: 0 0 20px 0;
      font-size: 13px;
      color: var(--text-secondary, #64748B);
      line-height: 1.5;
      max-width: 280px;
    }

    .suggestion-chips {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      width: 100%;
    }

    .chip {
      background: var(--bg-card, white);
      border: 1px solid var(--border-color, #E2E8F0);
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary, #64748B);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      text-align: left;
    }

    .chip:hover {
      border-color: #6366F1;
      color: #6366F1;
      background: rgba(99,102,241,0.04);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99,102,241,0.1);
    }

    .chip i { font-size: 13px; }

    /* ==================== MESSAGE BUBBLES ==================== */
    .message-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      animation: msgFadeIn 0.3s ease-out;
    }

    @keyframes msgFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message-row.user { justify-content: flex-end; }
    .message-row.bot { justify-content: flex-start; }

    .msg-avatar {
      width: 28px;
      height: 28px;
      min-width: 28px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .bot-avatar {
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white;
    }

    .msg-bubble {
      max-width: 82%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 13.5px;
      line-height: 1.55;
      font-weight: 500;
    }

    .message-row.user .msg-bubble {
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white;
      border-bottom-right-radius: 6px;
    }

    .message-row.bot .msg-bubble {
      background: var(--bg-card, white);
      color: var(--text-primary, #1E293B);
      border: 1px solid var(--border-color, #E2E8F0);
      border-bottom-left-radius: 6px;
    }

    .msg-bubble.error {
      border-color: rgba(239, 68, 68, 0.2) !important;
      background: rgba(239, 68, 68, 0.04) !important;
    }

    .msg-text {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .msg-meta {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .db-badge {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted, #94A3B8);
      background: var(--bg-inset, #F1F5F9);
      padding: 3px 8px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .db-badge i { font-size: 9px; }

    /* ==================== TYPING INDICATOR ==================== */
    .typing-bubble { padding: 14px 20px !important; }

    .typing-indicator {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #A5B4FC;
      animation: typingBounce 1.4s ease-in-out infinite;
    }

    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typingBounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    /* ==================== INPUT AREA ==================== */
    .chat-input-area {
      padding: 14px 16px 12px;
      background: var(--bg-card, white);
      border-top: 1px solid var(--border-color, #E2E8F0);
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-main, #F8FAFC);
      border: 1.5px solid var(--border-color, #E2E8F0);
      border-radius: 16px;
      padding: 4px 6px 4px 16px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-wrapper:focus-within {
      border-color: #6366F1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .input-wrapper input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text-primary, #1E293B);
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      padding: 8px 0;
    }

    .input-wrapper input::placeholder {
      color: var(--text-muted, #94A3B8);
      font-weight: 400;
    }

    .send-btn {
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 12px;
      border: none;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .send-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .input-hint {
      display: block;
      text-align: center;
      font-size: 10px;
      color: var(--text-muted, #94A3B8);
      margin-top: 8px;
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    /* ==================== RESPONSIVE ==================== */
    @media (max-width: 480px) {
      .chatbot-panel {
        width: calc(100vw - 16px);
        right: 8px;
        bottom: 90px;
        max-height: 70vh;
        border-radius: 20px;
      }
      .chatbot-fab { bottom: 16px; right: 16px; }
    }
  `]
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  private chatbotService = inject(ChatbotService);
  private authService = inject(AuthService);

  isOpen = signal(false);
  isLoading = signal(false);
  messages = signal<ChatMessage[]>([]);

  inputText = '';
  private msgCounter = 0;
  private shouldScroll = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  sendSuggestion(text: string) {
    this.inputText = text;
    this.send();
  }

  send() {
    const question = this.inputText.trim();
    if (!question || this.isLoading()) return;

    const userId = this.authService.getUserId() ?? 1;

    // Add user message
    const userMsg: ChatMessage = {
      id: ++this.msgCounter,
      role: 'user',
      content: question,
      timestamp: new Date()
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.inputText = '';
    this.isLoading.set(true);
    this.shouldScroll = true;

    // Call backend
    this.chatbotService.ask({ userId, question }).subscribe({
      next: (res) => {
        const botMsg: ChatMessage = {
          id: ++this.msgCounter,
          role: 'bot',
          content: res.answer,
          timestamp: new Date(res.timestamp),
          sql: res.generatedSql,
          database: res.databaseQueried,
          isError: !res.success
        };
        this.messages.update(msgs => [...msgs, botMsg]);
        this.isLoading.set(false);
        this.shouldScroll = true;
      },
      error: (err) => {
        const errMsg: ChatMessage = {
          id: ++this.msgCounter,
          role: 'bot',
          content: 'Oops! I couldn\'t reach the server. Please check if the chatbot service is running.',
          timestamp: new Date(),
          isError: true
        };
        this.messages.update(msgs => [...msgs, errMsg]);
        this.isLoading.set(false);
        this.shouldScroll = true;
      }
    });
  }

  clearChat() {
    const userId = this.authService.getUserId() ?? 1;
    this.messages.set([]);
    this.chatbotService.clearHistory(userId).subscribe();
  }

  private scrollToBottom() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const el = this.messageContainer?.nativeElement;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      } catch (e) {}
    }
  }
}
