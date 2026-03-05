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

      <!-- Header -->
      <div class="dashboard-header">
        <h1><i class="bi bi-graph-up me-2"></i>Analyse Avancée du Stock</h1>
        <p class="text-muted">Classification ABC, prévisions de demande, indicateurs de performance et alertes de réapprovisionnement.</p>
      </div>

      <!-- Loading -->
      <div *ngIf="chargement" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3 text-muted">Calcul des indicateurs...</p>
      </div>

      <!-- Error -->
      <div *ngIf="!chargement && erreur" class="alert alert-danger d-flex align-items-center">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <span>Impossible de charger l'analyse. Vérifiez que le serveur est démarré.</span>
        <button class="btn btn-outline-danger btn-sm ms-auto" (click)="chargerDonnees()">
          <i class="bi bi-arrow-clockwise me-1"></i>Réessayer
        </button>
      </div>

      <!-- Content -->
      <div *ngIf="!chargement && !erreur && data">

        <!-- ═══ KPI CARDS ═══ -->
        <div class="row g-3 mb-4">
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--primary-light);">
                <i class="bi bi-box-seam-fill" style="color: var(--primary);"></i>
              </div>
              <div>
                <div class="stat-number">{{ data.indicateursGlobaux.totalProduits }}</div>
                <div class="stat-label">Produits en stock</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--warning-light);">
                <i class="bi bi-receipt" style="color: var(--warning);"></i>
              </div>
              <div>
                <div class="stat-number">{{ data.indicateursGlobaux.totalCommandes90j }}</div>
                <div class="stat-label">Commandes (90j)</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--success-light);">
                <i class="bi bi-cash-stack" style="color: var(--success);"></i>
              </div>
              <div>
                <div class="stat-number">{{ data.indicateursGlobaux.chiffreAffaires90j | number:'1.0-0' }}</div>
                <div class="stat-label">CA 90 jours (TND)</div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="stat-card">
              <div class="stat-icon" [style.background]="data.indicateursGlobaux.croissanceMensuelle >= 0 ? 'var(--success-light)' : 'var(--danger-light)'">
                <i class="bi" [class.bi-graph-up-arrow]="data.indicateursGlobaux.croissanceMensuelle >= 0"
                   [class.bi-graph-down-arrow]="data.indicateursGlobaux.croissanceMensuelle < 0"
                   [style.color]="data.indicateursGlobaux.croissanceMensuelle >= 0 ? 'var(--success)' : 'var(--danger)'"></i>
              </div>
              <div>
                <div class="stat-number" [style.color]="data.indicateursGlobaux.croissanceMensuelle >= 0 ? 'var(--success)' : 'var(--danger)'">
                  {{ data.indicateursGlobaux.croissanceMensuelle >= 0 ? '+' : '' }}{{ data.indicateursGlobaux.croissanceMensuelle }}%
                </div>
                <div class="stat-label">Croissance mensuelle</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ ROW 2: Alerts + Stock Value + Avg Turnover ═══ -->
        <div class="row g-3 mb-4">
          <div class="col-lg-4 col-md-6">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--warning-light);">
                <i class="bi bi-exclamation-triangle-fill" style="color: var(--warning);"></i>
              </div>
              <div>
                <div class="stat-number" style="color: var(--warning);">{{ data.indicateursGlobaux.produitsEnAlerte }}</div>
                <div class="stat-label">Produits en alerte</div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--danger-light);">
                <i class="bi bi-x-circle-fill" style="color: var(--danger);"></i>
              </div>
              <div>
                <div class="stat-number" style="color: var(--danger);">{{ data.indicateursGlobaux.produitsEnRupture }}</div>
                <div class="stat-label">Ruptures de stock</div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--primary-light);">
                <i class="bi bi-arrow-repeat" style="color: var(--primary);"></i>
              </div>
              <div>
                <div class="stat-number">{{ data.indicateursGlobaux.tauxRotationMoyen }}x</div>
                <div class="stat-label">Rotation moyenne (90j)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ ABC ANALYSIS + SALES TREND ═══ -->
        <div class="row g-4 mb-4">

          <!-- ABC Classification -->
          <div class="col-lg-5">
            <div class="card h-100">
              <div class="card-header">
                <h6 class="mb-0 fw-bold"><i class="bi bi-pie-chart-fill me-2 text-primary"></i>Classification ABC (Pareto)</h6>
              </div>
              <div class="card-body">
                <p class="text-muted small mb-3">Répartition des produits selon leur contribution au chiffre d'affaires (Principe de Pareto 80/20).</p>

                <!-- ABC Visual Bars -->
                <div class="mb-3">
                  <div class="d-flex align-items-center mb-2">
                    <span class="badge me-2" style="background: var(--primary); width: 32px;">A</span>
                    <div class="flex-grow-1">
                      <div class="progress" style="height: 24px; border-radius: 6px;">
                        <div class="progress-bar" role="progressbar"
                             [style.width.%]="data.resumeABC.pourcentageCA_A"
                             style="background: var(--primary); font-size: 0.75rem; font-weight: 600;">
                          {{ data.resumeABC.pourcentageCA_A }}%
                        </div>
                      </div>
                    </div>
                    <span class="ms-2 fw-bold small" style="min-width: 45px;">{{ data.resumeABC.produitsA }} prod.</span>
                  </div>
                  <div class="d-flex align-items-center mb-2">
                    <span class="badge me-2" style="background: var(--warning); width: 32px;">B</span>
                    <div class="flex-grow-1">
                      <div class="progress" style="height: 24px; border-radius: 6px;">
                        <div class="progress-bar" role="progressbar"
                             [style.width.%]="data.resumeABC.pourcentageCA_B"
                             style="background: var(--warning); font-size: 0.75rem; font-weight: 600;">
                          {{ data.resumeABC.pourcentageCA_B }}%
                        </div>
                      </div>
                    </div>
                    <span class="ms-2 fw-bold small" style="min-width: 45px;">{{ data.resumeABC.produitsB }} prod.</span>
                  </div>
                  <div class="d-flex align-items-center">
                    <span class="badge me-2" style="background: var(--text-secondary); width: 32px;">C</span>
                    <div class="flex-grow-1">
                      <div class="progress" style="height: 24px; border-radius: 6px;">
                        <div class="progress-bar" role="progressbar"
                             [style.width.%]="data.resumeABC.pourcentageCA_C"
                             style="background: var(--text-secondary); font-size: 0.75rem; font-weight: 600;">
                          {{ data.resumeABC.pourcentageCA_C }}%
                        </div>
                      </div>
                    </div>
                    <span class="ms-2 fw-bold small" style="min-width: 45px;">{{ data.resumeABC.produitsC }} prod.</span>
                  </div>
                </div>

                <div class="small text-muted mt-3" style="line-height: 1.6;">
                  <div><span class="badge me-1" style="background: var(--primary);">A</span> Produits stratégiques — 80% du CA</div>
                  <div><span class="badge me-1" style="background: var(--warning);">B</span> Produits intermédiaires — 15% du CA</div>
                  <div><span class="badge me-1" style="background: var(--text-secondary);">C</span> Produits courants — 5% du CA</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sales Trend Chart -->
          <div class="col-lg-7">
            <div class="card h-100">
              <div class="card-header">
                <h6 class="mb-0 fw-bold"><i class="bi bi-bar-chart-fill me-2 text-primary"></i>Tendance des Ventes</h6>
              </div>
              <div class="card-body">
                <div *ngIf="data.tendanceVentes.length === 0" class="empty-state py-4">
                  <i class="bi bi-bar-chart" style="font-size: 2rem; color: var(--text-secondary);"></i>
                  <p class="text-muted mt-2">Aucune donnée de vente disponible.</p>
                </div>

                <div *ngIf="data.tendanceVentes.length > 0" class="chart-container">
                  <div class="d-flex align-items-end justify-content-between" style="height: 200px; gap: 4px;">
                    <div *ngFor="let tv of tendanceVisibles; let i = index"
                         class="chart-bar-wrapper d-flex flex-column align-items-center justify-content-end"
                         style="flex: 1; height: 100%;">
                      <small class="fw-bold mb-1" style="font-size: 0.65rem; color: var(--primary);">
                        {{ tv.chiffreAffaires | number:'1.0-0' }}
                      </small>
                      <div class="chart-bar"
                           [style.height.%]="getBarHeight(tv.chiffreAffaires)"
                           [style.background]="i === tendanceVisibles.length - 1 ? 'var(--primary)' : 'var(--primary-light)'"
                           style="width: 100%; max-width: 50px; border-radius: 6px 6px 0 0; transition: height 0.5s ease; min-height: 4px;">
                      </div>
                      <small class="mt-1 text-muted" style="font-size: 0.65rem;">{{ tv.periode.substring(5) }}</small>
                    </div>
                  </div>
                  <div class="text-center mt-2">
                    <small class="text-muted">Mois — Chiffre d'affaires en TND</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ PRODUCT ANALYSIS TABLE ═══ -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h6 class="mb-0 fw-bold"><i class="bi bi-table me-2 text-primary"></i>Analyse par Produit</h6>
            <div class="d-flex gap-2 flex-wrap">
              <select class="form-select form-select-sm" style="width: auto;" [(ngModel)]="filtreABC" (ngModelChange)="filtrer()">
                <option value="">Toutes classes</option>
                <option value="A">Classe A</option>
                <option value="B">Classe B</option>
                <option value="C">Classe C</option>
              </select>
              <select class="form-select form-select-sm" style="width: auto;" [(ngModel)]="filtreAlerte" (ngModelChange)="filtrer()">
                <option value="">Tous les états</option>
                <option value="alerte">En alerte seulement</option>
                <option value="sain">Sains seulement</option>
              </select>
              <select class="form-select form-select-sm" style="width: auto;" [(ngModel)]="tri" (ngModelChange)="filtrer()">
                <option value="score">Tri: Score santé</option>
                <option value="ca">Tri: Chiffre d'affaires</option>
                <option value="rotation">Tri: Taux de rotation</option>
                <option value="stock">Tri: Stock</option>
              </select>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th class="text-center">ABC</th>
                    <th class="text-center">Stock</th>
                    <th class="text-center">Vendu (90j)</th>
                    <th class="text-center">CA (TND)</th>
                    <th class="text-center">Rotation</th>
                    <th class="text-center">Jours</th>
                    <th class="text-center">Réappro.</th>
                    <th class="text-center">Prévision</th>
                    <th class="text-center">Tendance</th>
                    <th class="text-center">Santé</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngIf="produitsFiltres.length === 0">
                    <td colspan="11" class="text-center py-4">
                      <div class="empty-state">
                        <i class="bi bi-funnel" style="font-size: 2rem; color: var(--text-secondary);"></i>
                        <p class="text-muted mt-2">Aucun produit ne correspond aux filtres.</p>
                      </div>
                    </td>
                  </tr>
                  <tr *ngFor="let p of produitsFiltres" [class.table-danger]="p.stockActuel === 0" [class.table-warning]="p.alerteStock && p.stockActuel > 0">
                    <!-- Product -->
                    <td>
                      <div class="fw-semibold">{{ p.produitNom }}</div>
                      <small class="text-muted">{{ p.categorieNom }}</small>
                    </td>
                    <!-- ABC -->
                    <td class="text-center">
                      <span class="badge" [style.background]="getABCColor(p.classificationABC)">{{ p.classificationABC }}</span>
                    </td>
                    <!-- Stock -->
                    <td class="text-center">
                      <span [class.text-danger]="p.stockActuel === 0" [class.fw-bold]="p.stockActuel === 0">{{ p.stockActuel }}</span>
                    </td>
                    <!-- Vendu 90j -->
                    <td class="text-center">{{ p.totalVendu }}</td>
                    <!-- CA -->
                    <td class="text-center">{{ p.chiffreAffaires | number:'1.0-0' }}</td>
                    <!-- Rotation -->
                    <td class="text-center">
                      <span [style.color]="p.tauxRotation >= 2 ? 'var(--success)' : p.tauxRotation >= 1 ? 'var(--warning)' : 'var(--danger)'"
                            class="fw-semibold">{{ p.tauxRotation }}x</span>
                    </td>
                    <!-- Jours restants -->
                    <td class="text-center">
                      <span *ngIf="p.joursStockRestant < 999">{{ p.joursStockRestant }}j</span>
                      <span *ngIf="p.joursStockRestant >= 999" class="text-muted">-</span>
                    </td>
                    <!-- Point de réappro -->
                    <td class="text-center">{{ p.pointReapprovisionnement }}</td>
                    <!-- Prévision -->
                    <td class="text-center">{{ p.previsionDemandeMensuelle }}</td>
                    <!-- Tendance -->
                    <td class="text-center">
                      <i class="bi" [class.bi-arrow-up-circle-fill]="p.tendance === 'HAUSSE'"
                         [class.bi-dash-circle-fill]="p.tendance === 'STABLE'"
                         [class.bi-arrow-down-circle-fill]="p.tendance === 'BAISSE'"
                         [style.color]="p.tendance === 'HAUSSE' ? 'var(--success)' : p.tendance === 'BAISSE' ? 'var(--danger)' : 'var(--text-secondary)'"
                         style="font-size: 1.1rem;"></i>
                    </td>
                    <!-- Score -->
                    <td class="text-center" style="min-width: 110px;">
                      <div class="d-flex align-items-center justify-content-center gap-2">
                        <div class="progress flex-grow-1" style="height: 8px; max-width: 60px; border-radius: 4px;">
                          <div class="progress-bar" role="progressbar"
                               [style.width.%]="p.scoreSante"
                               [style.background]="getScoreColor(p.scoreSante)"
                               style="border-radius: 4px;"></div>
                        </div>
                        <small class="fw-bold" [style.color]="getScoreColor(p.scoreSante)">{{ p.scoreSante }}</small>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ LEGEND ═══ -->
        <div class="card mt-4">
          <div class="card-body">
            <h6 class="fw-bold mb-3"><i class="bi bi-info-circle me-2 text-primary"></i>Légende des Indicateurs</h6>
            <div class="row g-3">
              <div class="col-md-4">
                <div class="small">
                  <div class="fw-semibold mb-1">Taux de Rotation</div>
                  <div class="text-muted">Quantité vendue (90j) / Stock actuel. Un taux élevé indique une forte demande.</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="small">
                  <div class="fw-semibold mb-1">Point de Réapprovisionnement</div>
                  <div class="text-muted">Seuil de stock minimum calculé. Commander quand le stock atteint ce niveau.</div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="small">
                  <div class="fw-semibold mb-1">Score de Santé (0-100)</div>
                  <div class="text-muted">Indicateur composite : niveau de stock, rotation, classe ABC, tendance, couverture stock.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AnalyseStockComponent implements OnInit {
  data: AnalyseStock | null = null;
  chargement = true;
  erreur = false;

  produitsFiltres: AnalyseProduit[] = [];
  filtreABC = '';
  filtreAlerte = '';
  tri = 'score';

  tendanceVisibles: any[] = [];
  maxCA = 0;

  constructor(
    private analyseService: AnalyseStockService,
    
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement = true;
    this.erreur = false;

    this.analyseService.analyserStock().subscribe({
      next: (data) => {
        this.data = data;
        this.preparerTendance();
        this.filtrer();
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
        this.erreur = true;
      }
    });
  }

  filtrer(): void {
    if (!this.data) return;

    let liste = [...this.data.analyseParProduit];

    if (this.filtreABC) {
      liste = liste.filter(p => p.classificationABC === this.filtreABC);
    }
    if (this.filtreAlerte === 'alerte') {
      liste = liste.filter(p => p.alerteStock);
    } else if (this.filtreAlerte === 'sain') {
      liste = liste.filter(p => !p.alerteStock);
    }

    switch (this.tri) {
      case 'score': liste.sort((a, b) => a.scoreSante - b.scoreSante); break;
      case 'ca': liste.sort((a, b) => b.chiffreAffaires - a.chiffreAffaires); break;
      case 'rotation': liste.sort((a, b) => b.tauxRotation - a.tauxRotation); break;
      case 'stock': liste.sort((a, b) => a.stockActuel - b.stockActuel); break;
    }

    this.produitsFiltres = liste;
  }

  preparerTendance(): void {
    if (!this.data) return;
    // Show last 12 months max
    const tv = this.data.tendanceVentes;
    this.tendanceVisibles = tv.slice(Math.max(0, tv.length - 12));
    this.maxCA = Math.max(...this.tendanceVisibles.map((v: any) => v.chiffreAffaires), 1);
  }

  getBarHeight(ca: number): number {
    return Math.max((ca / this.maxCA) * 100, 3);
  }

  getABCColor(abc: string): string {
    switch (abc) {
      case 'A': return 'var(--primary)';
      case 'B': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 70) return 'var(--success)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--danger)';
  }
}
