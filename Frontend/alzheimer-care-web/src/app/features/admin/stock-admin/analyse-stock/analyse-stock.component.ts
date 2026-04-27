import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AnalyseStockService } from '../../../../core/services/analyse-stock.service';
import { AnalyseStock, AnalyseProduit } from '../../../../core/models/analyse-stock.model';

@Component({
  selector: 'app-analyse-stock',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="fade-in">
      <!-- Clinical medical header -->
      <div class="dashboard-header clinical-brand p-4 mb-4 shadow-sm" style="border-radius: 16px; background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); position: relative; overflow: hidden; border: 1px solid var(--border-color);">
        <div style="position: relative; z-index: 2;">
          <h1 class="text-white mb-2 fw-bold d-flex align-items-center gap-3">
             <div class="icon-circle shadow-sm" style="background: rgba(96, 165, 250, 0.15); color: #60A5FA; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-graph-up-arrow"></i>
             </div>
             Diagnostics de l'Inventaire
          </h1>
          <p class="text-white-50 mb-0 ms-2">Performance du catalogue médical, prévisions et optimisation ABC.</p>
        </div>
        <div style="position: absolute; right: -5%; top: -30%; width: 250px; height: 250px; background: radial-gradient(circle, rgba(96,165,250,0.1) 0%, rgba(0,0,0,0) 70%); border-radius: 50%;"></div>
      </div>

      <!-- Loading Skeleton -->
      <div *ngIf="chargement" class="p-5 text-center mt-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3 text-muted fw-semibold">Analyse de l'inventaire médical en cours...</p>
      </div>

      <!-- Error -->
      <div *ngIf="!chargement && erreur" class="alert bg-danger-soft d-flex align-items-center shadow-sm" style="border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
        <i class="bi bi-exclamation-triangle-fill me-3 fs-3 text-danger"></i>
        <span class="fw-semibold text-danger">Impossible de charger le rapport d'analyse clinique.</span>
        <button class="btn btn-danger btn-sm ms-auto rounded-pill" (click)="chargerDonnees()">
          <i class="bi bi-arrow-clockwise me-1"></i>Relancer
        </button>
      </div>

      <!-- Main Content -->
      <div *ngIf="!chargement && !erreur && data">

        <!-- KPI Row 1 -->
        <div class="row g-3 mb-4 stagger-fade-in">
          <!-- CA -->
          <div class="col-lg-3 col-md-6">
            <div class="card clinical-card border-0 shadow-sm h-100" style="border-radius: 16px;">
              <div class="card-body p-4 text-center">
                <div class="icon-circle mx-auto mb-3" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(78,128,238,0.1); color: var(--accent-color, #4E80EE); font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">
                  <i class="bi bi-cash-stack"></i>
                </div>
                <h6 class="text-secondary text-uppercase mb-1 fw-bold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Chiffre d'Aff. (90j)</h6>
                <div class="fw-bold text-primary mb-1" style="font-size: 1.6rem;">{{ data.indicateursGlobaux.chiffreAffaires90j | number:'1.0-0' }}</div>
                <div class="badge rounded border fw-bold" [ngClass]="data.indicateursGlobaux.croissanceMensuelle >= 0 ? 'bg-success-soft text-success border-success' : 'bg-danger-soft text-danger border-danger'">
                  <i class="bi" [class.bi-arrow-up]="data.indicateursGlobaux.croissanceMensuelle >= 0" [class.bi-arrow-down]="data.indicateursGlobaux.croissanceMensuelle < 0"></i>
                  {{ Math.abs(data.indicateursGlobaux.croissanceMensuelle) }}% /mois
                </div>
              </div>
            </div>
          </div>
          <!-- Produits -->
          <div class="col-lg-3 col-md-6">
            <div class="card clinical-card border-0 shadow-sm h-100" style="border-radius: 16px;">
               <div class="card-body p-4 text-center">
                <div class="icon-circle mx-auto mb-3" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(16,185,129,0.1); color: #10B981; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">
                  <i class="bi bi-box-seam-fill"></i>
                </div>
                <h6 class="text-secondary text-uppercase mb-1 fw-bold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Appareillages Gérés</h6>
                <div class="fw-bold text-primary" style="font-size: 1.8rem;">{{ data.indicateursGlobaux.totalProduits }}</div>
               </div>
            </div>
          </div>
          <!-- Rotation -->
          <div class="col-lg-3 col-md-6">
            <div class="card clinical-card border-0 shadow-sm h-100" style="border-radius: 16px;">
               <div class="card-body p-4 text-center">
                <div class="icon-circle mx-auto mb-3" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(99,102,241,0.1); color: #6366F1; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">
                  <i class="bi bi-arrow-repeat"></i>
                </div>
                <h6 class="text-secondary text-uppercase mb-1 fw-bold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Taux de Rotation</h6>
                <div class="fw-bold text-primary" style="font-size: 1.8rem;">{{ data.indicateursGlobaux.tauxRotationMoyen }}<span style="font-size: 1rem;">x</span></div>
               </div>
            </div>
          </div>
          <!-- Alertes -->
          <div class="col-lg-3 col-md-6">
            <div class="card clinical-card border-0 shadow-sm h-100" style="border-radius: 16px;" [ngClass]="{'border border-warning': data.indicateursGlobaux.produitsEnAlerte > 0}">
               <div class="card-body p-4 text-center">
                <div class="icon-circle mx-auto mb-3" [class.pulse-warning]="data.indicateursGlobaux.produitsEnAlerte > 0" style="width: 50px; height: 50px; border-radius: 12px; background: rgba(245,158,11,0.1); color: #F59E0B; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">
                  <i class="bi bi-heart-pulse-fill"></i>
                </div>
                <h6 class="text-secondary text-uppercase mb-1 fw-bold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Alerte / Rupture</h6>
                <div class="fw-bold text-primary" style="font-size: 1.8rem;">
                  <span class="text-warning">{{ data.indicateursGlobaux.produitsEnAlerte }}</span>
                  <span class="text-muted fs-5 mx-1">/</span>
                  <span class="text-danger">{{ data.indicateursGlobaux.produitsEnRupture }}</span>
                </div>
               </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row g-4 mb-4 stagger-fade-in-delayed">
           <!-- Trend Chart -->
           <div class="col-lg-7">
             <div class="card clinical-card border-0 shadow-sm h-100" style="border-radius: 16px;">
               <div class="card-header bg-card-surface border-bottom-0 p-4 pb-0 d-flex justify-content-between align-items-center">
                 <h6 class="mb-0 fw-bold d-flex align-items-center gap-2 text-primary">
                   <div class="icon-circle" style="background: rgba(78,128,238,0.15); color: var(--accent-color, #4E80EE); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-bar-chart-fill"></i></div>
                   Dynamique de Distribution (12 mois)
                 </h6>
               </div>
               <div class="card-body p-4 d-flex flex-column h-100 bg-card-surface">
                  <div *ngIf="data.tendanceVentes.length === 0" class="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-5 text-center">
                    <i class="bi bi-bar-chart text-muted mb-3" style="font-size: 3rem; opacity: 0.3;"></i>
                    <p class="text-muted fw-semibold">Données d'historique insuffisantes.</p>
                  </div>
                  
                  <div *ngIf="data.tendanceVentes.length > 0" class="flex-grow-1 chart-wrapper w-100 d-flex align-items-end justify-content-between pt-4" style="min-height: 220px; gap: 8px;">
                    <div *ngFor="let tv of tendanceVisibles; let i = index" class="d-flex flex-column align-items-center justify-content-end h-100 chart-bar-item" style="flex: 1;">
                       <div class="fw-bold mb-2 text-center chart-value" style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0; transition: opacity 0.2s; transform: translateY(5px);">
                          {{ tv.chiffreAffaires | number:'1.0-0' }}<br>TND
                       </div>
                       <div class="chart-bar animated-bar w-100 mx-auto"
                            [style.height.%]="getBarHeight(tv.chiffreAffaires)"
                            [ngStyle]="{'background': i === tendanceVisibles.length - 1 ? 'linear-gradient(to top, rgba(78,128,238,0.6), var(--accent-color, #4E80EE))' : 'var(--bg-inset)', 'max-width': '40px', 'border-radius': '4px 4px 0 0', 'transition': 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'}">
                       </div>
                       <small class="mt-2 text-muted fw-bold font-monospace" style="font-size: 0.7rem;">{{ tv.periode.substring(5) }}</small>
                    </div>
                  </div>
               </div>
             </div>
           </div>

           <!-- ABC Classification -->
           <div class="col-lg-5">
             <div class="card clinical-card border-0 shadow-sm h-100" style="border-radius: 16px;">
               <div class="card-header bg-card-surface border-bottom-0 p-4 pb-0 d-flex justify-content-between align-items-center">
                 <h6 class="mb-0 fw-bold d-flex align-items-center gap-2 text-primary">
                   <div class="icon-circle" style="background: rgba(16,185,129,0.15); color: #10B981; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-pie-chart-fill"></i></div>
                   Priorisation Médicale (Méthode ABC)
                 </h6>
               </div>
               <div class="card-body p-4 d-flex flex-column justify-content-center bg-card-surface">
                 <p class="text-muted small mb-4 fw-semibold">Distinction des équipements critiques (A) vs standards (C) selon l'impact sur la distribution.</p>
                 
                 <!-- Stat A -->
                 <div class="mb-4">
                   <div class="d-flex justify-content-between align-items-center mb-2">
                     <div class="d-flex align-items-center gap-2">
                        <span class="badge rounded d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 28px; height: 28px; background: var(--accent-color, #4E80EE); color: white;">A</span>
                        <span class="fw-bold text-primary">Priorité Haute</span>
                     </div>
                     <span class="small fw-bold text-muted">{{ data.resumeABC.produitsA }} unités</span>
                   </div>
                   <div class="progress" style="height: 12px; border-radius: 4px; background: var(--bg-inset); overflow: visible;">
                     <div class="progress-bar animated-progress shadow-sm" role="progressbar" 
                          [style.width.%]="data.resumeABC.pourcentageCA_A" 
                          style="background: linear-gradient(90deg, rgba(78,128,238,0.7), var(--accent-color, #4E80EE)); border-radius: 4px; position: relative;">
                          <div class="position-absolute end-0 top-100 mt-1 fw-bold text-primary" style="font-size: 0.8rem;">{{ data.resumeABC.pourcentageCA_A }}% Vol.</div>
                     </div>
                   </div>
                 </div>

                 <!-- Stat B -->
                 <div class="mb-4 pt-3">
                   <div class="d-flex justify-content-between align-items-center mb-2">
                     <div class="d-flex align-items-center gap-2">
                        <span class="badge rounded d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 28px; height: 28px; background: #38bdf8; color: white;">B</span>
                        <span class="fw-bold text-primary">Priorité Moyenne</span>
                     </div>
                     <span class="small fw-bold text-muted">{{ data.resumeABC.produitsB }} unités</span>
                   </div>
                   <div class="progress" style="height: 12px; border-radius: 4px; background: var(--bg-inset); overflow: visible;">
                     <div class="progress-bar animated-progress shadow-sm" role="progressbar" 
                          [style.width.%]="data.resumeABC.pourcentageCA_B" 
                          style="background: linear-gradient(90deg, rgba(56,189,248,0.7), #38bdf8); border-radius: 4px; position: relative;">
                          <div class="position-absolute end-0 top-100 mt-1 fw-bold text-primary" style="font-size: 0.8rem;">{{ data.resumeABC.pourcentageCA_B }}% Vol.</div>
                     </div>
                   </div>
                 </div>

                 <!-- Stat C -->
                 <div class="pt-3">
                   <div class="d-flex justify-content-between align-items-center mb-2">
                     <div class="d-flex align-items-center gap-2">
                        <span class="badge rounded d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 28px; height: 28px; background: #94a3b8; color: white;">C</span>
                        <span class="fw-bold text-primary">Standard</span>
                     </div>
                     <span class="small fw-bold text-muted">{{ data.resumeABC.produitsC }} unités</span>
                   </div>
                   <div class="progress" style="height: 12px; border-radius: 4px; background: var(--bg-inset); overflow: visible;">
                     <div class="progress-bar animated-progress" role="progressbar" 
                          [style.width.%]="data.resumeABC.pourcentageCA_C" 
                          style="background: #94a3b8; border-radius: 4px; position: relative;">
                          <div class="position-absolute end-0 top-100 mt-1 fw-bold text-muted" style="font-size: 0.8rem;">{{ data.resumeABC.pourcentageCA_C }}% Vol.</div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

        <!-- Data Grid Table -->
        <div class="card clinical-card border-0 shadow-sm animate-fade-up" style="border-radius: 16px; overflow: hidden; animation-delay: 0.3s;">
           <div class="card-header bg-card-surface border-bottom-0 pt-4 pb-3 px-4">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                 <h6 class="mb-0 fw-bold d-flex align-items-center gap-2 text-primary">
                   <div class="icon-circle" style="background: var(--bg-inset); color: var(--text-secondary); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="bi bi-funnel-fill"></i></div>
                   Registre & Diagnostic d'État
                 </h6>
                 <div class="d-flex gap-2 flex-wrap p-2 rounded-3" style="background: var(--bg-inset);">
                   <select class="form-select form-select-sm border-0 bg-transparent fw-bold text-primary" style="width: auto; min-width: 140px; box-shadow: none;" [(ngModel)]="tri" (ngModelChange)="filtrer()">
                     <option value="score">Trier: Santé (Score)</option>
                     <option value="ca">Trier: Volume</option>
                     <option value="rotation">Trier: Rotation</option>
                     <option value="stock">Trier: Niveau Stock</option>
                   </select>
                   <div class="vr mx-1 d-none d-md-block opacity-25"></div>
                   <select class="form-select form-select-sm border-0 bg-transparent fw-semibold text-secondary" style="width: auto; box-shadow: none;" [(ngModel)]="filtreABC" (ngModelChange)="filtrer()">
                     <option value="">Classes: ABC</option>
                     <option value="A">Classe A</option>
                     <option value="B">Classe B</option>
                     <option value="C">Classe C</option>
                   </select>
                   <div class="vr mx-1 d-none d-md-block opacity-25"></div>
                   <select class="form-select form-select-sm border-0 bg-transparent fw-semibold text-secondary" style="width: auto; box-shadow: none;" [(ngModel)]="filtreAlerte" (ngModelChange)="filtrer()">
                     <option value="">État: Tous</option>
                     <option value="alerte">Alerte Clinique (Seulement)</option>
                     <option value="sain">Sain (Seulement)</option>
                   </select>
                 </div>
              </div>
           </div>
           <div class="card-body p-0 bg-card-surface">
              <div class="table-responsive">
                 <table class="table table-hover mb-0 clinical-table align-middle">
                    <thead style="background: var(--bg-inset); border-bottom: 2px solid var(--border-color);">
                       <tr>
                         <th class="border-0 px-4 py-3 text-secondary fw-bold text-uppercase" style="font-size:0.75rem;">Désignation Produit</th>
                         <th class="border-0 py-3 text-secondary fw-bold text-center text-uppercase" style="font-size:0.75rem;">Crit. ABC</th>
                         <th class="border-0 py-3 text-secondary fw-bold text-center text-uppercase" style="font-size:0.75rem;">Stock Act.</th>
                         <th class="border-0 py-3 text-secondary fw-bold text-center text-uppercase" style="font-size:0.75rem;">Volume (90j)</th>
                         <th class="border-0 py-3 text-secondary fw-bold text-end text-uppercase" style="font-size:0.75rem;">CA (TND)</th>
                         <th class="border-0 py-3 text-secondary fw-bold text-center text-uppercase" style="font-size:0.75rem;" title="Taux de Rotation">Rotx</th>
                         <th class="border-0 py-3 text-secondary fw-bold text-center text-uppercase" style="font-size:0.75rem;" title="Autonomie (Jours)">Auto.</th>
                         <th class="border-0 py-3 text-secondary fw-bold text-center text-uppercase" style="font-size:0.75rem;" title="Seuil Réappro">Seuil</th>
                         <th class="border-0 py-3 text-secondary fw-bold text-center text-uppercase" style="font-size:0.75rem;" title="Tendance">Demande</th>
                         <th class="border-0 px-4 py-3 text-secondary fw-bold text-center text-uppercase" style="font-size:0.75rem;" title="Indice de Vitalité / Santé">H-Score</th>
                       </tr>
                    </thead>
                    <tbody>
                      <tr *ngIf="produitsFiltres.length === 0">
                        <td colspan="10" class="text-center p-5 bg-card-surface">
                          <i class="bi bi-funnel text-muted opacity-25 mb-3 d-block" style="font-size: 2.5rem;"></i>
                          <p class="fw-bold text-primary mb-0">Aucun produit médical ne correspond.</p>
                          <small class="text-muted fw-semibold">Essayez de modifier les filtres d'analyse.</small>
                        </td>
                      </tr>
                      
                      <tr *ngFor="let p of produitsFiltres" class="stagger-row" style="border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
                         <td class="px-4 py-3">
                           <div class="fw-bold text-primary text-truncate" style="max-width: 200px;" [title]="p.produitNom">{{ p.produitNom }}</div>
                           <div class="small text-secondary fw-semibold">{{ p.categorieNom }}</div>
                         </td>
                         <td class="py-3 text-center">
                           <span class="badge rounded shadow-sm" [ngStyle]="getABCBadgeStyle(p.classificationABC)" style="width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800;">{{ p.classificationABC }}</span>
                         </td>
                         <td class="py-3 text-center">
                           <span class="badge" [ngClass]="p.stockActuel === 0 ? 'bg-danger-soft text-danger border border-danger' : (p.alerteStock ? 'bg-warning-soft text-warning border border-warning' : 'bg-transparent text-primary')" style="font-size: 0.85rem; padding: 4px 8px;">
                             {{ p.stockActuel }}
                           </span>
                         </td>
                         <td class="py-3 text-center text-secondary fw-semibold">{{ p.totalVendu }}</td>
                         <td class="py-3 text-end fw-bold text-primary font-monospace">{{ p.chiffreAffaires | number:'1.0-0' }}</td>
                         <td class="py-3 text-center">
                           <span class="badge rounded bg-inset border text-primary font-monospace">{{ p.tauxRotation }}x</span>
                         </td>
                         <td class="py-3 text-center text-secondary">
                           <span *ngIf="p.joursStockRestant < 999" class="fw-bold font-monospace">{{ p.joursStockRestant }}j</span>
                           <i *ngIf="p.joursStockRestant >= 999" class="bi bi-infinity opacity-50"></i>
                         </td>
                         <td class="py-3 text-center">
                           <span class="text-secondary fw-bold font-monospace" style="font-size: 0.85rem;">{{ p.pointReapprovisionnement }}</span>
                         </td>
                         <td class="py-3 text-center">
                           <i class="bi" [class.bi-arrow-up-right]="p.tendance === 'HAUSSE'"
                              [class.bi-dash-lg]="p.tendance === 'STABLE'"
                              [class.bi-arrow-down-right]="p.tendance === 'BAISSE'"
                              [ngStyle]="{'color': p.tendance === 'HAUSSE' ? '#10B981' : p.tendance === 'BAISSE' ? '#EF4444' : '#94A3B8', 'font-size': '1.2rem', 'font-weight': 'bold'}"></i>
                         </td>
                         <td class="px-4 py-3 text-center">
                           <!-- Vitality Score visualization -->
                           <div class="d-flex align-items-center justify-content-center gap-2">
                              <span class="fw-bold font-monospace" [ngStyle]="{'color': getScoreColor(p.scoreSante)}">{{ p.scoreSante }}</span>
                              <div class="progress shadow-sm" style="width: 50px; height: 6px; border-radius: 3px; background: var(--bg-inset);">
                                <div class="progress-bar" role="progressbar" [style.width.%]="p.scoreSante" [style.background-color]="getScoreColor(p.scoreSante)"></div>
                              </div>
                           </div>
                         </td>
                      </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clinical-card {
      border: 1px solid var(--border-color);
      border-radius: 16px;
      background: var(--bg-card);
      transition: all 0.2s;
    }
    .bg-card-surface { background-color: var(--bg-card); }
    .bg-inset { background-color: var(--bg-inset); }

    .bg-success-soft { background-color: rgba(16, 185, 129, 0.1) !important; color: #10B981 !important; }
    .bg-danger-soft { background-color: rgba(239, 68, 68, 0.1) !important; color: #EF4444 !important; }
    .bg-warning-soft { background-color: rgba(245, 158, 11, 0.1) !important; color: #F59E0B !important; }
    
    .stagger-fade-in > * {
      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      opacity: 0;
      transform: translateY(10px);
    }
    .stagger-fade-in > *:nth-child(1) { animation-delay: 0.05s; }
    .stagger-fade-in > *:nth-child(2) { animation-delay: 0.1s; }
    .stagger-fade-in > *:nth-child(3) { animation-delay: 0.15s; }
    .stagger-fade-in > *:nth-child(4) { animation-delay: 0.2s; }

    .stagger-fade-in-delayed > * {
      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      opacity: 0;
      transform: translateY(10px);
    }
    .stagger-fade-in-delayed > *:nth-child(1) { animation-delay: 0.2s; }
    .stagger-fade-in-delayed > *:nth-child(2) { animation-delay: 0.3s; }
    
    .animate-fade-up {
      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
      opacity: 0;
    }

    .stagger-row {
      animation: fadeIn 0.3s ease forwards;
    }
    .clinical-table tbody tr:hover {
      background-color: var(--bg-inset) !important;
    }

    .chart-wrapper {
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 4px;
    }
    .chart-bar-item:hover .chart-value {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    .chart-bar-item:hover .animated-bar {
      opacity: 0.8;
      box-shadow: 0 -4px 12px rgba(78, 128, 238, 0.2);
    }
    .animated-bar {
      border: 1px solid rgba(0,0,0,0.05);
      border-bottom: none;
    }
    .animated-progress {
      transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .pulse-warning {
      animation: warningPulse 2s infinite;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes warningPulse {
      0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.3); }
      70% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
      100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    }
    
    html[data-theme="dark"] .bg-card-surface { background-color: var(--bg-card); }
    html[data-theme="dark"] .bg-inset { background-color: var(--bg-inset); }
    html[data-theme="dark"] .clinical-table tbody tr:hover { background-color: var(--bg-inset) !important; }
    html[data-theme="dark"] .text-primary { color: #f8fafc !important; }
    html[data-theme="dark"] .text-secondary { color: #94a3b8 !important; }
  `]
})
export class AnalyseStockComponent implements OnInit {
  data: AnalyseStock | null = null;
  chargement = true;
  erreur = false;
  Math = Math;

  produitsFiltres: AnalyseProduit[] = [];
  tri = 'score';
  filtreABC = '';
  filtreAlerte = '';

  constructor(private analyseStockService: AnalyseStockService) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement = true;
    this.erreur = false;
    this.analyseStockService.analyserStock().subscribe({
      next: (res: any) => {
        this.data = res;
        this.filtrer();
        this.chargement = false;
      },
      error: (err: any) => {
        console.error('Erreur analyse', err);
        this.erreur = true;
        this.chargement = false;
      }
    });
  }

  // Returns max 12 months for chart display
  get tendanceVisibles() {
    return this.data ? this.data.tendanceVentes.slice(0, 12) : [];
  }

  getBarHeight(valeur: number): number {
    if (!this.data || this.data.tendanceVentes.length === 0) return 0;
    const max = Math.max(...this.data.tendanceVentes.map(t => t.chiffreAffaires));
    if (max === 0) return 0;
    // min 10% height to ensure it's visible if > 0
    return Math.max(10, Math.floor((valeur / max) * 100));
  }

  getABCBadgeStyle(classification: string) {
    if (classification === 'A') return { background: 'var(--accent-color, #4E80EE)', color: 'white' };
    if (classification === 'B') return { background: '#38bdf8', color: 'white' };
    if (classification === 'C') return { background: '#94a3b8', color: 'white' };
    return { background: '#e2e8f0', color: '#475569' };
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 50) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  }

  filtrer(): void {
    if (!this.data) return;
    
    let result = [...this.data.analyseParProduit];

    // Filter ABC
    if (this.filtreABC) {
      result = result.filter(p => p.classificationABC === this.filtreABC);
    }
    
    // Filter Alert
    if (this.filtreAlerte === 'alerte') {
      result = result.filter(p => p.alerteStock || p.stockActuel === 0);
    } else if (this.filtreAlerte === 'sain') {
      result = result.filter(p => !p.alerteStock && p.stockActuel > 0);
    }

    // Sort
    result.sort((a, b) => {
      switch (this.tri) {
        case 'ca': return b.chiffreAffaires - a.chiffreAffaires;
        case 'rotation': return b.tauxRotation - a.tauxRotation;
        case 'stock': return a.stockActuel - b.stockActuel; // ascend
        case 'score': default: return b.scoreSante - a.scoreSante;
      }
    });

    this.produitsFiltres = result;
  }
}
