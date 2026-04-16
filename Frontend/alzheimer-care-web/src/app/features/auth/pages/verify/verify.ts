import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verify-container" style="text-align: center; padding-top: 100px;">
      
      <!-- Loading State -->
      <div *ngIf="status === 'loading'">
        <h2>Verifying your account...</h2>
        <p>Please wait.</p>
      </div>

      <!-- Success State -->
      <div *ngIf="status === 'success'">
        <h2 style="color: green;">Account Verified! <i class="fa-solid fa-check-circle"></i></h2>
        <p>You can now log in.</p>
        <a routerLink="/auth/login" style="padding: 10px 20px; background: #4E80EE; color: white; text-decoration: none; border-radius: 5px;">Go to Login</a>
      </div>

      <!-- Error State -->
      <div *ngIf="status === 'error'">
        <h2 style="color: red;">Verification Failed</h2>
        <p>The link is invalid or expired.</p>
        <a routerLink="/auth/login">Back to Login</a>
      </div>

    </div>
  `
})
export class VerifyComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const code = params.get('code');
      this.status = 'loading';

      if (!code) {
        this.status = 'error';
        return;
      }

      // Note: responseType: 'text' is needed because backend returns plain text.
      this.http.get(`http://localhost:9083/auth/verify?code=${code}`, { responseType: 'text' })
        .subscribe({
          next: (response) => {
            console.log(response);
            this.status = 'success';
          },
          error: (err) => {
            console.error(err);
            this.status = 'error';
          }
        });
    });
  }
}