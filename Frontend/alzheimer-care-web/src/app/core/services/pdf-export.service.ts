import { Injectable } from '@angular/core';
import { Assessment, Patient } from '../../core/models/assessment.models';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  constructor() {}

  async exportAssessmentToPDF(patient: Patient, assessments: Assessment[]): Promise<void> {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 50;

    // QR content: patient infos + URL to dashboard
    const nameParts = `${patient.name}`.trim().split(/\s+/);
    const first = nameParts.slice(0, -1).join(' ') || patient.name;
    const last = nameParts.slice(-1).join('') || '';
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${patient.name}`,
      `N:${last};${first};;;`,
      `NOTE:Patient ID: ${patient.id}`,
      `NOTE:Birth: ${patient.birthDate} · Age: ${patient.age}`,
      `NOTE:Stage: ${patient.alzheimerStage} · Risk: ${patient.riskLevel}`,
      'END:VCARD'
    ].join('\n');
    const qrPayload = vcard;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 140 });

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Cognitive Assessment Report', 40, y);
    doc.addImage(qrDataUrl, 'PNG', pageWidth - 40 - 120, y - 20, 120, 120);
    y += 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patient.name}`, 40, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`ID: ${patient.id}   •   DoB: ${patient.birthDate}   •   Stage: ${patient.alzheimerStage}   •   Risk: ${patient.riskLevel}`, 40, y);
    doc.setTextColor(0);
    y += 20;
    doc.setDrawColor(37, 99, 235);
    doc.line(40, y, pageWidth - 40, y);
    y += 20;

    // Latest assessment block (if exists)
    if (assessments.length > 0) {
      const latest = assessments[0];
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`Latest Assessment – ${latest.date}`, 40, y);
      y += 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Type: ${capitalize(latest.type)}   •   Evaluator: ${latest.evaluator}`, 40, y);
      y += 14;
      doc.text(`MMSE: ${latest.mmseScore}/30   •   MoCA: ${latest.moocaScore}/30   •   Trend: ${trendLabel(latest.trend, latest.trendPoints)}`, 40, y);
      y += 18;

      // Domain scores
      const domains = [
        ['Memory', latest.scores.memory],
        ['Orientation', latest.scores.orientation],
        ['Language', latest.scores.language],
        ['Executive functions', latest.scores.executiveFunctions]
      ];
      doc.setFont('helvetica', 'bold');
      doc.text('Domain Scores', 40, y);
      y += 12;
      doc.setFont('helvetica', 'normal');
      domains.forEach(([label, val]) => {
        doc.text(`${label}: ${val}/10`, 50, y);
        y += 14;
      });
      if (latest.observations) {
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Clinical Observations', 40, y);
        y += 12;
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(doc, latest.observations, 40, y, pageWidth - 80, 12);
      }
      y += 16;
    }

    // History table (if many)
    if (assessments.length > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Assessment History', 40, y);
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      // Table headers
      const colX = [40, 140, 260, 360, 440];
      doc.text('Date', colX[0], y);
      doc.text('Type', colX[1], y);
      doc.text('Evaluator', colX[2], y);
      doc.text('MMSE', colX[3], y);
      doc.text('MoCA', colX[4], y);
      y += 10;
      doc.setDrawColor(200);
      doc.line(40, y, pageWidth - 40, y);
      y += 8;
      // Rows
      assessments.forEach(a => {
        doc.text(a.date, colX[0], y);
        doc.text(capitalize(a.type), colX[1], y);
        doc.text(a.evaluator, colX[2], y);
        doc.text(`${a.mmseScore}/30`, colX[3], y);
        doc.text(`${a.moocaScore}/30`, colX[4], y);
        y += 12;
        if (y > 760) {
          doc.addPage();
          y = 50;
        }
      });
    }

    // Footer
    doc.setFontSize(9);
    const ts = new Date().toLocaleString();
    doc.text(`Generated on ${ts} · Alzheimer Care Pro`, 40, 820);

    // Download
    doc.save(`cognitive-report-${patient.id}.pdf`);
  }

}

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const split = doc.splitTextToSize(text, maxWidth) as string[];
  split.forEach((line) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

function trendLabel(trend: 'up' | 'down' | 'stable', pts?: number): string {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  if (pts == null) return `${arrow} Ref.`;
  const sign = pts >= 0 ? '+' : '';
  return `${arrow} ${sign}${pts} pts`;
}
