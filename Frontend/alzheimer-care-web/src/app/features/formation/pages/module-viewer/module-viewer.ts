import { Component, OnInit, AfterViewInit, ElementRef, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormationService, Module, Ressource } from '../../services/formation.service';
import { FormationStepperComponent } from '../../components/formation-stepper/formation-stepper';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { catchError, finalize, of, switchMap, timeout } from 'rxjs';
import gsap from 'gsap';
import { getModuleById, getRessourcesForModule, MODULES_ALZHEIMER } from '../../data/formation-alzheimer-demo';

@Component({
  selector: 'app-module-viewer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormationStepperComponent],
  templateUrl: './module-viewer.html',
  styleUrls: ['./module-viewer.scss']
})
export class ModuleViewerComponent implements OnInit, AfterViewInit {
  module: Module | null = null;
  modules: Module[] = [];
  ressources: Ressource[] = [];
  loading = true;
  programmeId!: number;
  moduleId!: number;
  introText = '';
  tipsText = '';
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private route: ActivatedRoute,
    private svc: FormationService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.programmeId = Number(params.get('programmeId')) || 1;
      this.moduleId = Number(params.get('moduleId')) || 1;
      this.loadModuleData();
    });
  }

  private loadModuleData() {
    this.loading = true;
    this.module = null;
    this.modules = [];
    this.ressources = [];
    this.introText = '';
    this.tipsText = '';
    const fallbackModule = getModuleById(this.moduleId) ?? {
      id: this.moduleId,
      titre: 'Module démo',
      type: 'Article',
      dureeEstimee: 10,
      contenu: 'Contenu de démonstration.',
    };

    this.svc.getModulesByProgramme(this.programmeId).pipe(
      timeout(3000),
      catchError(() => of(MODULES_ALZHEIMER))
    ).subscribe({
      next: (m) => {
        this.modules = Array.isArray(m) && m.length ? m : MODULES_ALZHEIMER;
      }
    });

    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.module = this.module ?? fallbackModule;
        this.parseContenu(this.module.contenu ?? '');
        if (!this.ressources.length) this.ressources = getRessourcesForModule(this.moduleId);
        this.cdr.detectChanges();
        this.animateWhenReady();
      }
    }, 4000);

    this.svc.getModule(this.moduleId).pipe(
      timeout(3000),
      catchError(() => of(fallbackModule)),
      switchMap((m) => {
        this.module = m ?? fallbackModule;
        this.parseContenu(this.module.contenu ?? '');
        return this.svc.getRessourcesByModule(this.moduleId).pipe(
          timeout(3000),
          catchError(() => of(getRessourcesForModule(this.moduleId)))
        );
      }),
      finalize(() => {
        clearTimeout(safetyTimeout);
        this.loading = false;
        this.module = this.module ?? fallbackModule;
        this.parseContenu(this.module.contenu ?? '');
        if (!this.ressources.length) this.ressources = getRessourcesForModule(this.moduleId);
        this.cdr.detectChanges();
        this.animateWhenReady();
      })
    ).subscribe({
      next: (r) => {
        this.ressources = Array.isArray(r) && r.length ? r : getRessourcesForModule(this.moduleId);
      },
      error: () => {
        this.module = this.module ?? fallbackModule;
        this.parseContenu(this.module.contenu ?? '');
        this.ressources = getRessourcesForModule(this.moduleId);
      }
    });
  }

  ngAfterViewInit() {}

  private animateWhenReady() {
    if (!this.isBrowser) return;
    setTimeout(() => {
      const el = document.querySelector('.viewer-content');
      if (el) {
        gsap.from(el, { opacity: 0, y: 30, duration: 0.6, ease: 'power2.out' });
      }
    }, 150);
  }

  safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isVideoUrl(url: string): boolean {
    if (!url) return false;
    const u = url.toLowerCase();
    return u.includes('youtube') || u.includes('vimeo') || u.includes('.mp4') || u.includes('youtu.be');
  }

  getYoutubeEmbed(url: string): SafeResourceUrl {
    let id = '';
    if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]?.split('?')[0] || '';
    else if (url.includes('v=')) id = (url.split('v=')[1] || '').split('&')[0];
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }

  getVimeoEmbed(url: string): SafeResourceUrl {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    const id = m ? m[1] : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.vimeo.com/video/${id}`);
  }

  isYoutubeUrl(url: string): boolean {
    return !!url && (url.includes('youtube') || url.includes('youtu.be'));
  }

  isVimeoUrl(url: string): boolean {
    return !!url && url.includes('vimeo');
  }

  get currentModuleIndex(): number {
    return this.modules.findIndex((m) => m.id === this.moduleId);
  }

  get prevModule(): Module | null {
    const i = this.currentModuleIndex;
    return i > 0 ? this.modules[i - 1] ?? null : null;
  }

  get nextModule(): Module | null {
    const i = this.currentModuleIndex;
    return i >= 0 && i < this.modules.length - 1 ? this.modules[i + 1] ?? null : null;
  }

  private parseContenu(contenu: string) {
    const sep = '|||CONSEILS|||';
    if (contenu.includes(sep)) {
      const [intro, tips] = contenu.split(sep);
      this.introText = (intro ?? '').trim();
      this.tipsText = (tips ?? '').trim();
    } else {
      this.introText = contenu.trim();
      this.tipsText = '';
    }
  }
}
