import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormationService, CertificateResponse } from '../../services/formation.service';
import { catchError, of } from 'rxjs';
import { FormationStepperComponent } from '../../components/formation-stepper/formation-stepper';
import gsap from 'gsap';

@Component({
  selector: 'app-certificat-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormationStepperComponent],
  templateUrl: './certificat-view.html',
  styleUrls: ['./certificat-view.scss']
})
export class CertificatViewComponent implements OnInit, AfterViewInit {
  @ViewChild('certCard') certCard!: ElementRef;
  @ViewChild('badgeEl') badgeEl!: ElementRef;

  certificate: CertificateResponse | null = null;
  loading = true;
  notFound = false;
  copied = false;
  signatureExpanded = false;

  // Fallback values from query params (backward compat)
  score = 0;
  total = 0;
  moduleId = 0;
  passed = false;
  moduleTitle = 'Formation';
  today = new Date();

  constructor(
    private route: ActivatedRoute,
    private svc: FormationService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((p) => {
      const code = p['certificateCode'] || p['code'];
      this.score = Number(p['score'] ?? 0);
      this.total = Number(p['total'] ?? 1);
      this.moduleId = Number(p['moduleId'] ?? 0);
      this.passed = p['passed'] === '1';

      if (code) {
        this.loadCertificate(code);
      } else {
        this.loading = false;
        // Legacy mode: no certificate code, show basic view
        if (this.moduleId) {
          this.svc.getModule(this.moduleId).pipe(
            catchError(() => of({ titre: 'Formation' }))
          ).subscribe({
            next: (m) => (this.moduleTitle = m.titre ?? 'Formation')
          });
        }
      }
    });
  }

  loadCertificate(code: string) {
    this.loading = true;
    this.svc.getCertificate(code).pipe(
      catchError(() => {
        this.notFound = true;
        return of(null);
      })
    ).subscribe({
      next: (cert) => {
        this.certificate = cert;
        if (cert) {
          this.score = cert.score;
          this.total = cert.total;
          this.moduleTitle = cert.moduleTitle;
          this.passed = true;
        }
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const card = this.certCard?.nativeElement;
      const badge = this.badgeEl?.nativeElement;
      const certLine = document.querySelector('.cert-line');
      const shine = document.querySelector('.shine');

      if (card) gsap.from(card, { opacity: 0, scale: 0.8, rotationY: -15, duration: 1, ease: 'back.out(1.4)', delay: 0.2 });
      if (badge) gsap.fromTo(badge, { scale: 0, rotation: 0 }, { scale: 1, rotation: 0, duration: 1, delay: 0.4, ease: 'elastic.out(1, 0.6)' });
      if (certLine) gsap.fromTo(certLine, { scaleX: 0 }, { scaleX: 1, duration: 0.8, delay: 0.6, ease: 'power2.out' });
      if (shine) {
        gsap.fromTo(shine, { opacity: 0 }, { opacity: 0.6, duration: 0.75, delay: 0.8 });
        gsap.to(shine, { opacity: 0, duration: 0.75, delay: 1.55 });
      }
    }, 300);
  }

  get verifyUrl(): string {
    if (!this.certificate) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/verify-certificate/${this.certificate.certificateCode}`;
  }

  get truncatedSignature(): string {
    if (!this.certificate) return '';
    const sig = this.certificate.digitalSignature;
    return sig.substring(0, 16) + '...' + sig.substring(sig.length - 16);
  }

  copyVerifyUrl() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.verifyUrl).then(() => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      });
    }
  }

  toggleSignature() {
    this.signatureExpanded = !this.signatureExpanded;
  }

  enregistrerCertificat() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
