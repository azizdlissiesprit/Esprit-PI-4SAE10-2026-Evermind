import { Injectable } from '@angular/core';
import { Assessment, Patient, ChartDataPoint } from '../../core/models/assessment.models';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  private readonly chartWidth = 500;
  private readonly chartHeight = 140;
  private readonly yMax = 30;

  constructor() {}

  exportAssessmentToPDF(patient: Patient, assessments: Assessment[]): void {
    // This is a simplified PDF export using browser's print functionality
    // In a real application, you would use a library like jsPDF or pdfmake
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    const htmlContent = this.generatePDFContent(patient, assessments);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cognitive Assessment Report - ${patient.name}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            border-bottom: 2px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
            text-align: center;
          }
          .patient-info { 
            margin-bottom: 30px; 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px;
          }
          .assessment-item { 
            margin-bottom: 25px; 
            border: 1px solid #ddd; 
            padding: 20px; 
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .score-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 15px; 
            margin: 15px 0;
          }
          .score-item { 
            background: #f1f5f9; 
            padding: 10px; 
            border-radius: 4px;
            text-align: center;
          }
          .domain-scores { 
            margin: 15px 0; 
          }
          .domain-item { 
            display: flex; 
            justify-content: space-between; 
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
          }
          .observations { 
            background: #e8f1ff; 
            padding: 15px; 
            border-radius: 4px; 
            margin-top: 15px;
            border-left: 4px solid #2563eb;
          }
          .alert { 
            background: #fee2e2; 
            border: 1px solid #f87171; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            border-left: 4px solid #dc2626;
          }
          h1 { color: #2563eb; }
          h2 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
          h3 { color: #475569; }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            text-align: center; 
            font-size: 12px; 
            color: #666;
          }
          .evolution-section { 
            margin-bottom: 25px; 
            border: 1px solid #ddd; 
            padding: 20px; 
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .evolution-section h2 { margin-top: 0; }
          .evolution-chart { 
            margin: 20px 0; 
            max-width: 100%; 
            height: auto;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Alzheimer Care Pro - Cognitive Assessment Report</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for the content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  }

  private getChartDataOrdered(assessments: Assessment[]): ChartDataPoint[] {
    return assessments.slice().reverse().map(a => ({
      date: a.date,
      mmse: a.mmseScore,
      mooca: a.moocaScore
    }));
  }

  private buildEvolutionSVG(assessments: Assessment[]): string {
    const data = this.getChartDataOrdered(assessments);
    if (data.length === 0) return '';
    const n = data.length;
    const xStep = n > 1 ? this.chartWidth / (n - 1) : this.chartWidth / 2;
    const toY = (score: number) =>
      Math.max(0, Math.min(this.chartHeight, ((this.yMax - score) / this.yMax) * this.chartHeight));
    const mmsePoints = data.map((p, i) => `${n > 1 ? i * xStep : this.chartWidth / 2},${toY(p.mmse)}`).join(' ');
    const mocaPoints = data.map((p, i) => `${n > 1 ? i * xStep : this.chartWidth / 2},${toY(p.mooca)}`).join(' ');
    return `
      <svg class="evolution-chart" viewBox="0 0 ${this.chartWidth} ${this.chartHeight}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:500px;">
        <line x1="0" y1="0" x2="${this.chartWidth}" y2="0" stroke="#e2e8f0" stroke-dasharray="4"/>
        <line x1="0" y1="${this.chartHeight/2}" x2="${this.chartWidth}" y2="${this.chartHeight/2}" stroke="#e2e8f0" stroke-dasharray="4"/>
        <line x1="0" y1="${this.chartHeight}" x2="${this.chartWidth}" y2="${this.chartHeight}" stroke="#e2e8f0"/>
        <polyline points="${mmsePoints}" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="${mocaPoints}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="0" y="${this.chartHeight + 14}" font-size="10" fill="#64748b">${data[0]?.date || ''}</text>
        <text x="${this.chartWidth - 60}" y="${this.chartHeight + 14}" font-size="10" fill="#64748b">${data[data.length - 1]?.date || ''}</text>
      </svg>
    `;
  }

  private generatePDFContent(patient: Patient, assessments: Assessment[]): string {
    const latestAssessment = assessments[0];
    const hasDeclineAlert = latestAssessment && latestAssessment.trend === 'down' && 
                           latestAssessment.trendPoints && latestAssessment.trendPoints <= -3;
    const chartDataOrdered = this.getChartDataOrdered(assessments);

    let content = `
      <div class="header">
        <h1>Cognitive Assessment Report</h1>
        <h2>${patient.name}</h2>
      </div>

      <div class="patient-info">
        <h3>Patient Information</h3>
        <p><strong>Date of Birth:</strong> ${patient.birthDate} (${patient.age} years)</p>
        <p><strong>Patient ID:</strong> ${patient.id}</p>
        <p><strong>Social Security:</strong> ${patient.secuNumber}</p>
        <p><strong>Alzheimer Stage:</strong> ${patient.alzheimerStage}</p>
        <p><strong>Risk Level:</strong> ${patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)}</p>
        <p><strong>Status:</strong> ${patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}</p>
        <p><strong>Last Updated:</strong> ${patient.lastUpdate}</p>
      </div>
    `;

    if (hasDeclineAlert) {
      content += `
        <div class="alert">
          <h3>⚠️ Cognitive Decline Alert</h3>
          <p>A significant drop in MMSE score was recorded during the last assessment (decrease > 3 points). 
          The current score is ${latestAssessment.mmseScore}/30. A reassessment of the care plan or a specialized consultation is recommended.</p>
        </div>
      `;
    }

    if (chartDataOrdered.length > 0) {
      content += `
        <div class="evolution-section">
          <h2>Cognitive Evolution Tracking</h2>
          <p>Evolution of MMSE and MoCA scores over time.</p>
          ${this.buildEvolutionSVG(assessments)}
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">MMSE</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">MoCA</th>
              </tr>
            </thead>
            <tbody>
              ${chartDataOrdered.map(p => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${p.date}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${p.mmse}/30</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${p.mooca}/30</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (latestAssessment) {
      content += `
        <div class="assessment-item">
          <h2>Latest Assessment - ${latestAssessment.date}</h2>
          <p><strong>Evaluator:</strong> ${latestAssessment.evaluator}</p>
          <p><strong>Type:</strong> ${latestAssessment.type.charAt(0).toUpperCase() + latestAssessment.type.slice(1)} Assessment</p>
          
          <div class="score-grid">
            <div class="score-item">
              <h4>MMSE Score</h4>
              <p style="font-size: 24px; font-weight: bold; color: ${latestAssessment.mmseScore < 20 ? '#dc2626' : '#16a34a'}">
                ${latestAssessment.mmseScore}/30
              </p>
            </div>
            <div class="score-item">
              <h4>MoCA Score</h4>
              <p style="font-size: 24px; font-weight: bold; color: ${latestAssessment.moocaScore < 20 ? '#dc2626' : '#16a34a'}">
                ${latestAssessment.moocaScore}/30
              </p>
            </div>
          </div>

          <h3>Domain Scores</h3>
          <div class="domain-scores">
            <div class="domain-item">
              <span>Memory</span>
              <strong>${latestAssessment.scores.memory}/10</strong>
            </div>
            <div class="domain-item">
              <span>Spatial-temporal Orientation</span>
              <strong>${latestAssessment.scores.orientation}/10</strong>
            </div>
            <div class="domain-item">
              <span>Language</span>
              <strong>${latestAssessment.scores.language}/10</strong>
            </div>
            <div class="domain-item">
              <span>Executive Functions</span>
              <strong>${latestAssessment.scores.executiveFunctions}/10</strong>
            </div>
          </div>

          <div class="observations">
            <h3>Clinical Observations</h3>
            <p>${latestAssessment.observations}</p>
          </div>
        </div>
      `;
    }

    if (assessments.length > 1) {
      content += `
        <div class="assessment-item">
          <h2>Assessment History</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Evaluator</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">MMSE</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">MoCA</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Trend</th>
              </tr>
            </thead>
            <tbody>
              ${assessments.map(assessment => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${assessment.date}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${assessment.evaluator}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${assessment.mmseScore}/30</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${assessment.moocaScore}/30</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                    ${assessment.trend === 'up' ? '↑' : assessment.trend === 'down' ? '↓' : '→'} 
                    ${assessment.trendPoints ? assessment.trendPoints + ' pts' : 'Ref.'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    return content;
  }
}
