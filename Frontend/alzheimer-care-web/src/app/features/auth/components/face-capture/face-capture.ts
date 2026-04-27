import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-face-capture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './face-capture.html',
  styleUrls: ['./face-capture.scss']
})
export class FaceCaptureComponent implements OnDestroy {
  @Input() title = 'Face ID';
  @Input() subtitle = 'Center your face inside the frame to continue.';
  @Input() compact = false;
  @Output() faceSelected = new EventEmitter<File | null>();

  @ViewChild('videoElement') private videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  cameraActive = false;
  isCapturing = false;
  cameraError = '';
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  private stream: MediaStream | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  async startCamera(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.cameraError = '';
    this.isCapturing = true;

    try {
      this.stopStream();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      this.stream = mediaStream;
      this.cameraActive = true;

      queueMicrotask(() => {
        const video = this.videoElement?.nativeElement;
        if (!video) {
          return;
        }
        video.srcObject = mediaStream;
        void video.play();
      });
    } catch (error) {
      this.cameraError = this.resolveCameraError(error);
      this.cameraActive = false;
    } finally {
      this.isCapturing = false;
    }
  }

  captureFrame(): void {
    const video = this.videoElement?.nativeElement;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      this.cameraError = 'The camera is not ready yet. Wait a moment and try again.';
      return;
    }

    const size = Math.min(video.videoWidth, video.videoHeight);
    const sourceX = (video.videoWidth - size) / 2;
    const sourceY = (video.videoHeight - size) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 720;

    const context = canvas.getContext('2d');
    if (!context) {
      this.cameraError = 'Could not capture the camera frame.';
      return;
    }

    context.drawImage(video, sourceX, sourceY, size, size, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.cameraError = 'Could not generate the face image.';
          return;
        }

        const file = new File([blob], `face-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        this.setSelectedFile(file);
        this.cameraActive = false;
        this.stopStream();
      },
      'image/jpeg',
      0.92
    );
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.cameraError = 'Please select an image file.';
      return;
    }

    this.cameraError = '';
    this.cameraActive = false;
    this.stopStream();
    this.setSelectedFile(file);
    input.value = '';
  }

  resetSelection(): void {
    this.cameraError = '';
    this.revokePreview();
    this.selectedFile = null;
    this.faceSelected.emit(null);
  }

  ngOnDestroy(): void {
    this.stopStream();
    this.revokePreview();
  }

  private setSelectedFile(file: File): void {
    this.revokePreview();
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
    this.faceSelected.emit(file);
  }

  private revokePreview(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  private stopStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  private resolveCameraError(error: unknown): string {
    const mediaError = error as DOMException | undefined;
    const errorName = mediaError?.name ?? 'UnknownError';

    switch (errorName) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Camera permission is blocked in the browser. Allow access and try again, or upload a portrait instead.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No camera was detected on this device. Upload a portrait instead.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'The camera is already in use by another application. Close it and try again.';
      case 'SecurityError':
        return 'Camera access requires a secure browser context. Open the app on localhost and try again.';
      default:
        return `Camera could not be started (${errorName}). You can still upload a portrait instead.`;
    }
  }
}
