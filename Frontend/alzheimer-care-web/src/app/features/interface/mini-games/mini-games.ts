import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconifyIconComponent } from '../../../shared/components/icon/icon.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mini-games',
  standalone: true,
  imports: [CommonModule, IconifyIconComponent],
  templateUrl: './mini-games.html',
  styleUrls: ['./mini-games.scss']
})
export class MiniGamesComponent {
  mode: 'hub' | 'reaction' | 'memory' | 'visual' | 'attention' = 'hub';
  started = false;
  score = 0;
  targetShown = false;
  countdown = 3;
  private timerId: any;
  private roundId: any;
  sequence: number[] = [];
  userSeq: number[] = [];
  stageLabel = '';
  constructor(private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(q => {
      const t = q.get('type') as any;
      this.mode = (t && ['reaction','memory','visual','attention'].includes(t)) ? t : 'hub';
      this.resetAll();
    });
  }
  select(mode: 'reaction'|'memory'|'visual'|'attention') {
    this.mode = mode;
    this.resetAll();
  }
  resetAll() {
    this.started = false;
    this.score = 0;
    this.countdown = 3;
    this.targetShown = false;
    this.sequence = [];
    this.userSeq = [];
    this.stageLabel = '';
    clearInterval(this.timerId);
    clearTimeout(this.roundId);
  }
  start() {
    this.started = true;
    this.score = 0;
    this.countdown = 3;
    clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.timerId);
        this.nextRound();
      }
    }, 1000);
  }
  nextRound() {
    this.targetShown = false;
    const delay = 600 + Math.random() * 1400;
    clearTimeout(this.roundId);
    this.roundId = setTimeout(() => {
      this.targetShown = true;
    }, delay);
  }
  hit() {
    if (!this.targetShown) return;
    this.score++;
    this.nextRound();
  }
  stop() {
    this.started = false;
    this.targetShown = false;
    clearInterval(this.timerId);
    clearTimeout(this.roundId);
    this.stageLabel = this.interpretStage(this.normalizedScore());
  }
  // Memory game (repeat sequence)
  startMemory() {
    this.started = true;
    this.sequence = Array.from({ length: 3 + Math.floor(Math.random()*3) }, () => Math.floor(Math.random()*4));
    this.userSeq = [];
  }
  pressMemory(i: number) {
    if (!this.started) return;
    this.userSeq.push(i);
    if (this.userSeq.length === this.sequence.length) {
      const correct = this.userSeq.every((v, idx) => v === this.sequence[idx]);
      this.score += correct ? 20 : 0;
      this.started = false;
      this.stageLabel = this.interpretStage(this.normalizedScore());
    }
  }
  // Visual (choose matching shape)
  chooseVisual(correct: boolean) {
    if (!this.started) this.started = true;
    if (correct) this.score += 10;
  }
  endVisual() {
    this.started = false;
    this.stageLabel = this.interpretStage(this.normalizedScore());
  }
  // Attention (tap even numbers)
  tapNumber(n: number) {
    if (!this.started) this.started = true;
    if (n % 2 === 0) this.score += 5;
  }
  endAttention() {
    this.started = false;
    this.stageLabel = this.interpretStage(this.normalizedScore());
  }
  normalizedScore(): number {
    return Math.max(0, Math.min(100, this.score));
  }
  interpretStage(pct: number): string {
    if (pct >= 75) return 'Normal';
    if (pct >= 55) return 'Léger';
    if (pct >= 35) return 'Modéré';
    return 'Sévère';
  }
}
