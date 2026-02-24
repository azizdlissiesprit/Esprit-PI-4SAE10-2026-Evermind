import { Injectable } from '@angular/core';
import { Patient, AutonomyAssessment, AutonomyChartPoint } from '../models/autonomy.model';

@Injectable({ providedIn: 'root' })
export class AutonomyPdfExportService {
  private readonly chartWidth = 500;
  private readonly chartHeight = 120;
  private readonly yMax = 25;

  exportToPDF(patient: Patient, assessments: AutonomyAssessment[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }
    const html = this.buildContent(patient, assessments);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head>
        <title>Autonomy Report - ${patient.name}</title>
        <style>
          body{font-family:Arial,sans-serif;margin:20px;line-height:1.6;color:#333}
          .header{border-bottom:2px solid #3b6ef8;padding-bottom:16px;margin-bottom:24px;text-align:center}
          .patient-info{background:#f4f6fb;padding:16px;border-radius:8px;margin-bottom:20px}
          .assessment-item{border:1px solid #e5e9f2;padding:16px;border-radius:8px;margin-bottom:16px;page-break-inside:avoid}
          .score-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:12px 0}
          .score-item{background:#eef2ff;padding:8px;border-radius:6px;text-align:center;font-size:13px}
          .total-score{font-size:20px;font-weight:700;color:#3b6ef8;margin:12px 0}
          .domain-list{margin:12px 0}
          .domain-list div{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:13px}
          .observations{background:#fef2f2;padding:12px;border-radius:6px;margin-top:12px;border-left:4px solid #ef4444}
          .evolution-section{margin-top:20px}
          .evolution-section h3{margin-bottom:12px;color:#1e293b}
          table{border-collapse:collapse;width:100%;font-size:13px}
          th,td{border:1px solid #e5e9f2;padding:8px;text-align:left}
          th{background:#f4f6fb;font-weight:600}
          .footer{margin-top:32px;padding-top:16px;border-top:1px solid #ddd;text-align:center;font-size:12px;color:#666}
        </style>
      </head><body>${html}<div class="footer">Generated on ${new Date().toLocaleString()} · Autonomy Dashboard Report</div></body></html>`);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  private buildContent(patient: Patient, assessments: AutonomyAssessment[]): string {
    const latest = assessments[0];
    const ordered = [...assessments].reverse();
    let html = `
      <div class="header"><h1>Autonomy Assessment Report</h1><h2>${patient.name}</h2></div>
      <div class="patient-info">
        <p><strong>ID:</strong> ${patient.id} &nbsp; <strong>DoB:</strong> ${patient.birthDate} (${patient.age} y) &nbsp; <strong>Stage:</strong> ${patient.alzheimerStage} &nbsp; <strong>Risk:</strong> ${patient.riskLevel}</p>
      </div>`;
    if (latest) {
      const s = latest.scores;
      html += `
      <div class="assessment-item">
        <h3>Latest assessment – ${latest.date}</h3>
        <p><strong>Evaluator:</strong> ${latest.evaluator} &nbsp; <strong>Assistance level:</strong> ${latest.assistanceLevel}</p>
        <div class="score-grid">
          <div class="score-item">Hygiene ${s.hygiene}/5</div>
          <div class="score-item">Feeding ${s.feeding}/5</div>
          <div class="score-item">Dressing ${s.dressing}/5</div>
          <div class="score-item">Mobility ${s.mobility}/5</div>
          <div class="score-item">Communication ${s.communication}/5</div>
        </div>
        <div class="total-score">Total: ${latest.totalScore}/25 ${latest.trendPoints != null ? (latest.trendPoints >= 0 ? '+' : '') + latest.trendPoints + ' pts' : ''}</div>`;
      if (latest.observations) html += `<div class="observations"><strong>Observations</strong><p>${latest.observations}</p></div>`;
      html += `</div>`;
    }
    if (ordered.length > 0) {
      const points = ordered.map(a => ({ date: a.date, totalScore: a.totalScore }));
      const n = points.length;
      const xStep = n > 1 ? this.chartWidth / (n - 1) : this.chartWidth / 2;
      const toY = (v: number) => Math.max(0, Math.min(this.chartHeight, ((this.yMax - v) / this.yMax) * this.chartHeight));
      const poly = points.map((p, i) => `${n > 1 ? i * xStep : this.chartWidth / 2},${toY(p.totalScore)}`).join(' ');
      html += `
      <div class="evolution-section">
        <h3>Autonomy score evolution (Total / 25)</h3>
        <svg viewBox="0 0 ${this.chartWidth} ${this.chartHeight}" style="width:100%;max-width:500px;height:140px">
          <polyline points="${poly}" fill="none" stroke="#3b6ef8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <table style="margin-top:12px">
          <thead><tr><th>Date</th><th>Evaluator</th><th>Total</th><th>Trend</th></tr></thead>
          <tbody>
            ${assessments.map(a => `<tr><td>${a.date}</td><td>${a.evaluator}</td><td>${a.totalScore}/25</td><td>${a.trendPoints != null ? (a.trendPoints >= 0 ? '+' : '') + a.trendPoints + ' pts' : '—'}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    }
    return html;
  }
}
