import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ── Dashboard ────────────────────────────────────────────────
export interface DashboardKpis {
  produitsExpires: number;
  expireDans30j: number;
  expireDans90j: number;
  valeurStockRisque: number;
  tauxRotation90j: number;
  anomaliesDetectees: number;
}

export interface ReapproAlert {
  produitId: number;
  nom: string;
  stock: number;
  ventesParJour: number;
  joursDeStock: number;
  urgence: string;   // 'critique' | 'attention'
}

export interface SalesAnomaly {
  date: string;
  articles: number;
  montant: number;
  type: string;
}

export interface DashboardAnalytics {
  genereLe: string;
  methode: string;
  kpis: DashboardKpis;
  alertesReapprovisionnement: ReapproAlert[];
  anomaliesVentes: SalesAnomaly[];
}

// ── Demand Forecast ──────────────────────────────────────────
export interface DemandPrevision {
  produitId: number;
  nom: string;
  stockActuel: number;
  demandePrevisionnelle30j: number;
  quantiteRecommandee: number;
  confiance: string;   // 'élevée' | 'moyenne' | 'faible'
  tendance: string;    // 'hausse' | 'stable' | 'baisse'
  r2Score?: number;
}

export interface DemandForecastResponse {
  periode: string;
  methode: string;
  totalProduits: number;
  previsions: DemandPrevision[];
}

// ── Expiration Risk ──────────────────────────────────────────
export interface ExpirationProduit {
  produitId: number;
  nom: string;
  categorie: string;
  stock: number;
  ventesParJour: number;
  joursAvantExpiration: number | null;
  risqueScore: number;
  statut: string;       // 'OK' | 'ATTENTION' | 'RISQUE_ELEVÉ' | 'EXPIRE' | 'RUPTURE'
  recommandation: string;
}

export interface ExpirationResume {
  totalProduits: number;
  expires: number;
  risqueEleve: number;
  attention: number;
  rupture: number;
  ok: number;
}

export interface ExpirationResponse {
  resume: ExpirationResume;
  produits: ExpirationProduit[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/api/analytics`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardAnalytics> {
    return this.http.get<DashboardAnalytics>(`${this.apiUrl}/dashboard`);
  }

  getDemandForecast(): Observable<DemandForecastResponse> {
    return this.http.get<DemandForecastResponse>(`${this.apiUrl}/demand-forecast`);
  }

  getExpirationRisk(): Observable<ExpirationResponse> {
    return this.http.get<ExpirationResponse>(`${this.apiUrl}/expiration`);
  }

  seedData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed`, {});
  }
}
