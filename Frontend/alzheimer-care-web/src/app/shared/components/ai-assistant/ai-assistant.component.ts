import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AiService, ConversationMessage, AiChatResponse } from '../../../core/services/ai.service';
import { PanierService } from '../../../core/services/panier.service';
import { TraductionService } from '../../../core/services/traduction.service';
import { Produit, isPromoActive } from '../../../core/models/produit.model';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  produits?: Produit[];
  timestamp: Date;
  typing?: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  animations: [
    trigger('panelSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px) scale(0.97)' }),
        animate('350ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('220ms cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0, transform: 'translateY(16px) scale(0.97)' }))
      ])
    ]),
    trigger('msgAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('280ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('productAnim', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-12px)' }),
          stagger(60, [animate('260ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <!-- Floating Trigger Button -->
    <div class="ai-fab-wrap">
      <button class="ai-fab" (click)="togglePanel()"
              [class.ai-fab-open]="isOpen"
              title="PharmaCare AI Assistant">
        <div class="ai-fab-rings">
          <span class="ai-fab-ring r1"></span>
          <span class="ai-fab-ring r2"></span>
        </div>
        <div class="ai-fab-icon">
          <i class="bi bi-robot" *ngIf="!isOpen"></i>
          <i class="bi bi-x-lg" *ngIf="isOpen"></i>
        </div>
        <span class="ai-fab-label">Assistant IA</span>
      </button>
      <div class="ai-fab-badge" *ngIf="unreadCount > 0 && !isOpen">{{ unreadCount }}</div>
    </div>

    <!-- Chat Panel -->
    <div *ngIf="isOpen" class="ai-panel" [@panelSlide]>

      <!-- Header -->
      <div class="ai-panel-header">
        <div class="ai-panel-header-left">
          <div class="ai-panel-avatar">
            <i class="bi bi-robot"></i>
            <span class="ai-online-dot"></span>
          </div>
          <div>
            <div class="ai-panel-name">PharmaCare AI</div>
            <div class="ai-panel-status">
              <span class="ai-status-dot"></span>
              En ligne
            </div>
          </div>
        </div>
        <div class="ai-panel-header-actions">
          <button class="ai-header-btn" (click)="clearConversation()" title="Nouvelle conversation">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
          <button class="ai-header-btn ai-close-btn" (click)="isOpen = false" title="Fermer">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="ai-messages" #messagesContainer>

        <!-- Welcome message -->
        <div *ngIf="messages.length === 0" class="ai-welcome">
          <div class="ai-welcome-orb">
            <i class="bi bi-robot"></i>
          </div>
          <h4 class="text-primary mt-2">Bonjour ! Je suis votre assistant.</h4>
          <p class="text-secondary text-sm">Posez-moi vos questions sur nos produits, équipements, ou conseils de santé.</p>

          <!-- Quick action chips -->
          <div class="ai-chips mt-3">
            <button *ngFor="let chip of quickChips" class="ai-chip text-primary border-primary" (click)="sendChip(chip.text)">
              <i class="bi me-1" [class]="chip.icon"></i>{{ chip.labelFr }}
            </button>
          </div>
        </div>

        <!-- Chat messages -->
        <div *ngFor="let msg of messages" [@msgAnim]
             class="ai-msg-wrap" [class.ai-msg-user]="msg.role === 'user'" [class.ai-msg-ai]="msg.role === 'assistant'">

          <!-- AI avatar -->
          <div *ngIf="msg.role === 'assistant'" class="ai-msg-avatar bg-primary text-white">
            <i class="bi bi-robot"></i>
          </div>

          <div class="ai-msg-content">
            <!-- Typing indicator -->
            <div *ngIf="msg.typing" class="ai-msg-bubble ai-bubble-ai bg-inset">
              <div class="ai-typing">
                <span></span><span></span><span></span>
              </div>
            </div>

            <!-- Regular message -->
            <div *ngIf="!msg.typing" class="ai-msg-bubble shadow-sm" [class.ai-bubble-ai]="msg.role === 'assistant'" [class.ai-bubble-user]="msg.role === 'user'">
              {{ msg.text }}
            </div>

            <!-- Suggested products -->
            <div *ngIf="msg.produits && msg.produits.length > 0" class="ai-products mt-2" [@productAnim]="msg.produits.length">
              <div class="ai-products-label text-primary font-weight-bold mb-1" style="font-size:0.8rem;">
                <i class="bi bi-bag-heart me-1"></i>
                Produits recommandés
              </div>
              <div *ngFor="let prod of msg.produits" class="ai-product-card d-flex align-items-center bg-white shadow-sm p-2 rounded mb-2 border">
                <div class="ai-product-img me-2" style="width: 40px; height: 40px; background: var(--bg-inset); border-radius: 6px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                  <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" [alt]="prod.nom" style="width: 100%; height: 100%; object-fit: cover;">
                  <i *ngIf="!prod.imageUrl" class="bi bi-box-seam text-secondary"></i>
                </div>
                <div class="ai-product-info flex-grow-1">
                  <div class="ai-product-name fw-bold" style="font-size:0.85rem; line-height: 1.2;">{{ prod.nom | slice:0:20 }}{{ prod.nom.length > 20 ? '...' : '' }}</div>
                  <div class="ai-product-price-row mt-1" style="font-size:0.8rem;">
                    <span class="ai-product-price text-primary fw-bold">{{ prod.prix | number:'1.2-2' }} TND</span>
                  </div>
                </div>
                <div class="ai-product-actions ms-2">
                  <button class="btn btn-sm btn-outline-primary py-1 px-2 border-0"
                          [class.text-success]="addedId === prod.id"
                          [disabled]="prod.quantite === 0 || addingId === prod.id"
                          (click)="addToCart(prod)" title="Ajouter au panier">
                    <span *ngIf="addingId === prod.id" class="spinner-border spinner-border-sm"></span>
                    <i *ngIf="addingId !== prod.id && addedId !== prod.id" class="bi bi-cart-plus"></i>
                    <i *ngIf="addedId === prod.id" class="bi bi-check-lg"></i>
                  </button>
                  <a [routerLink]="['/stock/catalogue', prod.id]" class="btn btn-sm text-secondary" (click)="isOpen = false" title="Détails">
                    <i class="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>

            <!-- Timestamp -->
            <div *ngIf="!msg.typing" class="ai-msg-time text-muted small mt-1" style="font-size:0.7rem;">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

      </div>

      <!-- Input Area -->
      <div class="ai-input-area p-3 border-top bg-white">
        <div class="ai-input-wrap position-relative">
          <input #inputField
                 type="text"
                 class="form-control rounded-pill pe-5 shadow-sm"
                 [(ngModel)]="currentMessage"
                 placeholder="Posez votre question..."
                 (keyup.enter)="sendMessage()"
                 [disabled]="isLoading"
                 maxlength="500">
          <button class="btn btn-primary rounded-circle position-absolute top-50 translate-middle-y end-0 me-1 d-flex align-items-center justify-content-center shadow-sm" 
                  style="width: 32px; height: 32px; padding: 0;"
                  (click)="sendMessage()" [disabled]="!currentMessage.trim() || isLoading">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm" style="width: 1rem; height: 1rem;"></span>
            <i *ngIf="!isLoading" class="bi bi-send-fill" style="font-size:0.85rem;"></i>
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .ai-fab-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 1050; display: flex; align-items: center; justify-content: center; }
    .ai-fab { width: 60px; height: 60px; border-radius: 50%; background: var(--accent-color, #4E80EE); color: white; border: none; box-shadow: 0 4px 15px rgba(78, 128, 238, 0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; }
    .ai-fab:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(78, 128, 238, 0.5); }
    .ai-fab-badge { position: absolute; top: -5px; right: -5px; background: #dc3545; color: white; font-size: 0.75rem; font-weight: bold; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
    .ai-fab-label { position: absolute; right: 100%; top: 50%; transform: translateY(-50%); margin-right: 15px; background: rgba(0,0,0,0.75); color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.3s; }
    .ai-fab:hover .ai-fab-label { opacity: 1; }
    
    .ai-panel { position: fixed; bottom: 100px; right: 24px; width: 380px; max-width: calc(100vw - 48px); height: 600px; max-height: calc(100vh - 120px); background: var(--bg-card, #ffffff); border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; z-index: 1050; border: 1px solid var(--border-color, #e2e8f0); }
    
    .ai-panel-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: var(--accent-color, #4E80EE); color: white; }
    .ai-panel-header-left { display: flex; align-items: center; gap: 12px; }
    .ai-panel-avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; position: relative; }
    .ai-online-dot { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 2px solid var(--accent-color, #4E80EE); }
    .ai-panel-name { font-weight: 600; line-height: 1.2; font-size: 1rem; }
    .ai-panel-status { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; opacity: 0.8; }
    .ai-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
    .ai-header-btn { background: transparent; border: none; color: white; font-size: 1.1rem; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; opacity: 0.8; }
    .ai-header-btn:hover { background: rgba(255,255,255,0.2); opacity: 1; }
    
    .ai-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; background: var(--bg-inset, #f8fafc); }
    
    .ai-welcome { text-align: center; padding: 20px 10px; margin-bottom: 10px; }
    .ai-welcome-orb { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-color, #4E80EE), #8fb1ff); color: white; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 4px 15px rgba(78, 128, 238, 0.3); }
    
    .ai-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
    .ai-chip { background: white; border: 1px solid var(--accent-color, #4E80EE); color: var(--accent-color, #4E80EE); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
    .ai-chip:hover { background: var(--accent-color, #4E80EE); color: white; }
    
    .ai-msg-wrap { display: flex; gap: 12px; max-width: 90%; }
    .ai-msg-user { align-self: flex-end; flex-direction: row-reverse; }
    .ai-msg-ai { align-self: flex-start; }
    .ai-msg-avatar { width: 32px; height: 32px; min-width: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
    .ai-msg-content { display: flex; flex-direction: column; }
    .ai-msg-user .ai-msg-content { align-items: flex-end; }
    
    .ai-msg-bubble { padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; line-height: 1.4; word-break: break-word; }
    .ai-bubble-ai { background: white; border-bottom-left-radius: 0; color: var(--text-primary); border: 1px solid var(--border-color); }
    .ai-bubble-user { background: var(--accent-color, #4E80EE); color: white; border-bottom-right-radius: 0; }
    
    .ai-typing { display: flex; gap: 4px; padding: 4px 2px; }
    .ai-typing span { width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; animation: bounce 1.4s infinite ease-in-out both; }
    .ai-typing span:nth-child(1) { animation-delay: -0.32s; }
    .ai-typing span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
  `]
})
export class AiAssistantComponent implements OnInit, AfterViewChecked {
  readonly isPromoActive = isPromoActive;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('inputField') private inputField!: ElementRef;

  isOpen = false;
  isLoading = false;
  currentMessage = '';
  messages: ChatMessage[] = [];
  conversationHistory: ConversationMessage[] = [];
  unreadCount = 0;
  addingId: number | null = null;
  addedId: number | null = null;
  private shouldScroll = false;

  quickChips = [
    { icon: 'bi-thermometer-half', labelFr: 'Équipements médicaux', labelEn: 'Medical equipment', text: 'Quels équipements médicaux avez-vous ?' },
    { icon: 'bi-heart-pulse', labelFr: 'Bien-être', labelEn: 'Well-being', text: 'Quels équipements recommandez-vous pour le bien-être ?' },
    { icon: 'bi-fire', labelFr: 'Produits en promo', labelEn: 'Products on sale', text: 'Quels produits sont en promotion ?' },
  ];

  constructor(
    public t: TraductionService,
    private aiService: AiService,
    private panierService: PanierService
  ) {}

  ngOnInit(): void {
    console.log('[AiAssistantComponent] Initialized.');
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
    console.log(`[AiAssistantComponent] Panel toggled: ${this.isOpen}`);
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => this.inputField?.nativeElement?.focus(), 350);
    }
  }

  sendChip(text: string): void {
    this.currentMessage = text;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.currentMessage.trim();
    if (!text || this.isLoading) return;

    console.log(`[AiAssistantComponent] Sending message: ${text}`);

    // Add user message
    this.messages.push({ role: 'user', text, timestamp: new Date() });
    this.conversationHistory.push({ role: 'user', contenu: text });
    this.currentMessage = '';
    this.shouldScroll = true;

    // Add typing indicator
    const typingMsg: ChatMessage = { role: 'assistant', text: '', timestamp: new Date(), typing: true };
    this.messages.push(typingMsg);
    this.isLoading = true;
    this.shouldScroll = true;

    this.aiService.chat(text, this.conversationHistory.slice(-8), 'fr').subscribe({
      next: (res: AiChatResponse) => {
        console.log('[AiAssistantComponent] Received AI response:', res);
        // Replace typing with real message
        const idx = this.messages.indexOf(typingMsg);
        if (idx >= 0) {
          this.messages[idx] = {
            role: 'assistant',
            text: res.reponse,
            produits: res.produitsSugeres,
            timestamp: new Date()
          };
        }
        this.conversationHistory.push({ role: 'assistant', contenu: res.reponse });
        this.isLoading = false;
        if (!this.isOpen) this.unreadCount++;
        this.shouldScroll = true;
      },
      error: (err) => {
        console.error('[AiAssistantComponent] Error receiving AI response:', err);
        const idx = this.messages.indexOf(typingMsg);
        if (idx >= 0) {
          this.messages[idx] = {
            role: 'assistant',
            text: 'Désolé, je suis temporairement indisponible. Veuillez réessayer.',
            timestamp: new Date()
          };
        }
        this.isLoading = false;
        this.shouldScroll = true;
      }
    });
  }

  clearConversation(): void {
    console.log('[AiAssistantComponent] Clearing conversation.');
    this.messages = [];
    this.conversationHistory = [];
  }

  addToCart(prod: Produit): void {
    if (!prod.id) return;
    console.log(`[AiAssistantComponent] Adding product ${prod.id} to cart.`);
    this.addingId = prod.id;
    this.panierService.ajouterProduit(prod.id, 1).subscribe({
      next: () => {
        console.log(`[AiAssistantComponent] Product ${prod.id} added to cart successfully.`);
        this.addingId = null;
        this.addedId = prod.id!;
        setTimeout(() => this.addedId = null, 2000);
      },
      error: (err) => { 
        console.error(`[AiAssistantComponent] Error adding product to cart:`, err);
        this.addingId = null; 
      }
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
