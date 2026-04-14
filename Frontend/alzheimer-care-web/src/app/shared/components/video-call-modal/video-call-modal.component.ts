import {
  Component, Input, Output, EventEmitter,
  OnDestroy, AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import DailyIframe from '@daily-co/daily-js';

@Component({
  selector: 'app-video-call-modal',
  template: `
    <div class="video-overlay" *ngIf="isOpen">
      <div class="video-container">
        <div class="video-header">
          <span>Video Consultation - {{ patientName }}</span>
          <button class="btn-close" (click)="closeCall()">End Call</button>
        </div>
        <div #dailyFrame class="daily-frame"></div>
      </div>
    </div>
  `,
  styles: [`
    .video-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .video-container {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 12px;
      overflow: hidden;
      width: 90vw;
      max-width: 1100px;
      height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    .video-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
      color: #fff;
      font-weight: 600;
      border-bottom: 2px solid #3b82f6;
    }
    .btn-close {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    .btn-close:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      transform: scale(1.05);
    }
    .daily-frame {
      flex: 1;
      background: #000;
    }
  `]
})
export class VideoCallModalComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Input() roomUrl = '';
  @Input() token = '';
  @Input() patientName = '';
  @Output() closed = new EventEmitter<void>();

  @ViewChild('dailyFrame') frameRef!: ElementRef;

  private callFrame: any;

  ngAfterViewInit() {
    if (this.isOpen && this.roomUrl) {
      this.startCall();
    }
  }

  ngOnChanges() {
    if (this.isOpen && this.roomUrl && this.frameRef) {
      this.startCall();
    }
  }

  startCall() {
    if (this.callFrame) { 
      this.callFrame.destroy(); 
    }

    this.callFrame = DailyIframe.createFrame(this.frameRef.nativeElement, {
      iframeStyle: { 
        width: '100%', 
        height: '100%', 
        border: 'none',
        borderRadius: '0 0 12px 12px'
      },
      showLeaveButton: false,
      showFullscreenButton: true,
    });

    this.callFrame
      .join({ url: this.roomUrl, token: this.token })
      .catch((err: any) => console.error('Daily.co Error:', err));

    this.callFrame.on('left-meeting', () => this.closeCall());
  }

  closeCall() {
    if (this.callFrame) {
      this.callFrame.leave().then(() => {
        this.callFrame.destroy();
        this.callFrame = null;
      });
    }
    this.closed.emit();
  }

  ngOnDestroy() {
    if (this.callFrame) { 
      this.callFrame.destroy(); 
    }
  }
}
