import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-alert-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './alert-detail.html',
  styleUrls: ['./alert-detail.scss']
})
export class AlertDetailComponent implements OnInit {
  alertId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Grab the ID from the URL (e.g. 9204)
    this.alertId = this.route.snapshot.paramMap.get('id');
  }
}