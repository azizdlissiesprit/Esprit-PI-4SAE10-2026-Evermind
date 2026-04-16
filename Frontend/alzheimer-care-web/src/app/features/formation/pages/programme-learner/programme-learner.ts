import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormationService, ProgrammeFormation, Module } from '../../services/formation.service';
import { FormationStepperComponent } from '../../components/formation-stepper/formation-stepper';
import { catchError, finalize, of, switchMap, timeout } from 'rxjs';
import gsap from 'gsap';
import { PROGRAMME_ALZHEIMER, MODULES_ALZHEIMER } from '../../data/formation-alzheimer-demo';

const FALLBACK_MODULES = MODULES_ALZHEIMER;

@Component({
  selector: 'app-programme-learner',
  standalone: true,
  imports: [CommonModule, RouterModule, FormationStepperComponent],
  templateUrl: './programme-learner.html',
  styleUrls: ['./programme-learner.scss']
})
export class ProgrammeLearnerComponent implements OnInit, AfterViewInit {
  @ViewChildren('modItem') modItems!: QueryList<ElementRef>;

  programme: ProgrammeFormation | null = null;
  modules: Module[] = [];
  loading = true;
  programmeId!: number;

  constructor(private route: ActivatedRoute, private svc: FormationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.programmeId = Number(params.get('id')) || 1;
      this.loadProgrammeData();
    });
  }

  private loadProgrammeData() {
    this.loading = true;
    this.programme = null;
    this.modules = [];
    const fallbackProgramme = { ...PROGRAMME_ALZHEIMER, id: this.programmeId };

    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.programme = this.programme ?? fallbackProgramme;
        if (!this.modules.length) this.modules = FALLBACK_MODULES;
        this.cdr.detectChanges();
      }
    }, 4000);

    this.svc.getProgramme(this.programmeId).pipe(
      timeout(3000),
      catchError(() => of(fallbackProgramme)),
      switchMap((p) => {
        this.programme = p ?? fallbackProgramme;
        return this.svc.getModulesByProgramme(this.programmeId).pipe(
          timeout(3000),
          catchError(() => of(FALLBACK_MODULES))
        );
      }),
      finalize(() => {
        clearTimeout(safetyTimeout);
        this.loading = false;
        this.programme = this.programme ?? fallbackProgramme;
        if (!this.modules.length) this.modules = FALLBACK_MODULES;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (m) => {
        const list = Array.isArray(m) ? m : [];
        this.modules = list.length ? list : FALLBACK_MODULES;
      },
      error: () => {
        this.programme = this.programme ?? fallbackProgramme;
        this.modules = FALLBACK_MODULES;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.animateModules(), 350);
  }

  private animateModules() {
    const items = this.modItems?.toArray() ?? [];
    items.forEach((el, i) => {
      if (el?.nativeElement) {
        gsap.from(el.nativeElement, {
        opacity: 0,
        x: -40,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power2.out'
      });
      }
    });
  }

  getTypeIcon(type: string) {
    if (type?.toLowerCase() === 'video') return 'fa-solid fa-video';
    if (type?.toLowerCase() === 'pdf') return 'fa-solid fa-file-pdf';
    return 'fa-solid fa-newspaper';
  }
}
