import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminAlertService } from '../../../../core/services/admin-alert.service';
import { TypeAlerte, Severite, StatutAlerte } from '../../../../core/models/enums';

@Component({
  selector: 'app-alert-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './alert-add.html',
  styleUrls: ['./alert-add.scss'] // Reuse user-add.scss or copy it
})
export class AlertAddComponent implements OnInit {
  alertForm: FormGroup;
  isEditMode = false;
  alertId: number | null = null;
  
  // Dropdown Options
  types = Object.values(TypeAlerte);
  severities = Object.values(Severite);
  statuses = Object.values(StatutAlerte);

  constructor(
    private fb: FormBuilder,
    private alertService: AdminAlertService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.alertForm = this.fb.group({
      patientId: ['', Validators.required],
      typeAlerte: ['FALL_DETECTION', Validators.required],
      severite: ['MOYENNE', Validators.required],
      statut: ['NOUVELLE', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.alertId = +id;
      this.alertService.getAlertById(this.alertId).subscribe(data => {
        this.alertForm.patchValue(data);
      });
    }
  }

  onSubmit() {
    if (this.alertForm.invalid) return;
    
    const request$ = this.isEditMode
      ? this.alertService.updateAlert(this.alertId!, this.alertForm.value)
      : this.alertService.addAlert(this.alertForm.value);

    request$.subscribe(() => {
      this.router.navigate(['/admin/alerts']);
    });
  }
}
