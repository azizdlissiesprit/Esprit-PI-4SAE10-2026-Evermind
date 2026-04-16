import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormationService, ProgrammeFormation } from '../../services/formation.service';
import { FormationStepperComponent } from '../../components/formation-stepper/formation-stepper';
import { catchError, finalize, of, timeout } from 'rxjs';
import gsap from 'gsap';
import { PROGRAMME_ALZHEIMER } from '../../data/formation-alzheimer-demo';

const FALLBACK_PROGRAMMES: ProgrammeFormation[] = [
  PROGRAMME_ALZHEIMER,
  {
    id: 2,
    titre: 'Communication avec le patient',
    theme: 'Relationnel',
    description: 'Techniques de communication adaptée avec une personne atteinte d\'Alzheimer.',
  },
];

function normalizeProgrammes(raw: unknown): ProgrammeFormation[] {
  const list = Array.isArray(raw)
    ? raw
    : (raw && typeof raw === 'object' && 'content' in raw && Array.isArray((raw as { content: unknown[] }).content))
      ? (raw as { content: ProgrammeFormation[] }).content
      : (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown[] }).data))
        ? (raw as { data: ProgrammeFormation[] }).data
        : [];
  return list.map((item: Record<string, unknown>, index: number) => ({
    id: typeof item?.id === 'number' ? item.id : (typeof item?.id === 'string' ? parseInt(item.id, 10) : index + 1),
    titre: (item?.titre ?? item?.title ?? 'Programme') as string,
    theme: (item?.theme ?? item?.category ?? 'Formation') as string,
    description: (item?.description ?? '') as string,
    dateCreation: item?.dateCreation as string | undefined,
  }));
}

@Component({
  selector: 'app-learn-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormationStepperComponent],
  templateUrl: './learn-catalog.html',
  styleUrls: ['./learn-catalog.scss']
})
export class LearnCatalogComponent implements OnInit, AfterViewInit {
  @ViewChildren('card') cards!: QueryList<ElementRef>;

  programmes: ProgrammeFormation[] = [];
  loading = true;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private svc: FormationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        if (this.programmes.length === 0) this.programmes = [...FALLBACK_PROGRAMMES];
        this.cdr.detectChanges();
        setTimeout(() => this.animateCards(), 150);
      }
    }, 4000);

    this.svc.getProgrammes().pipe(
      timeout(3000),
      catchError(() => of([])),
      finalize(() => {
        clearTimeout(safetyTimeout);
        this.loading = false;
        if (this.programmes.length === 0) this.programmes = [...FALLBACK_PROGRAMMES];
        this.cdr.detectChanges();
        setTimeout(() => this.animateCards(), 150);
      })
    ).subscribe({
      next: (p) => {
        const fromApi = normalizeProgrammes(p);
        this.programmes = fromApi.length > 0 ? fromApi : [...FALLBACK_PROGRAMMES];
        this.cdr.detectChanges();
        setTimeout(() => this.animateCards(), 150);
      },
      error: () => {
        if (this.programmes.length === 0) this.programmes = [...FALLBACK_PROGRAMMES];
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    if (!this.loading) this.animateCards();
  }

  private animateCards() {
    if (!this.isBrowser) return;
    const cards = this.cards?.toArray() ?? [];
    cards.forEach((card, i) => {
      if (card?.nativeElement) {
        const el = card.nativeElement as HTMLElement;
        el.style.opacity = '1';
        gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, delay: i * 0.08, ease: 'power2.out' });
      }
    });
    const titleEl = document.querySelector('.catalog-title');
    if (titleEl) {
      gsap.fromTo(titleEl, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
    }
  }
}
