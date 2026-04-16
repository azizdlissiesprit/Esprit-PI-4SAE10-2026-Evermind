import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormationService, VerifyCertificateResponse } from '../../services/formation.service';

type ViewState = 'idle' | 'loading' | 'valid' | 'revoked' | 'not_found' | 'error';

@Component({
    selector: 'app-verify-certificate',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './verify-certificate.html',
    styleUrls: ['./verify-certificate.scss']
})
export class VerifyCertificateComponent implements OnInit {
    codeInput = '';
    state: ViewState = 'idle';
    result: VerifyCertificateResponse | null = null;

    constructor(
        private route: ActivatedRoute,
        private svc: FormationService,
        private ngZone: NgZone
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            const code = params.get('code');
            if (code) {
                this.codeInput = code;
                this.verify();
            }
        });
    }

    verify() {
        const code = this.codeInput.trim();
        if (!code) return;

        this.state = 'loading';
        this.result = null;

        this.svc.verifyCertificate(code).subscribe({
            next: (res) => {
                this.ngZone.run(() => {
                    console.log('Verify response:', res);
                    this.result = res;
                    if (res.valid) {
                        this.state = 'valid';
                    } else if (res.status === 'REVOKED') {
                        this.state = 'revoked';
                    } else {
                        this.state = 'not_found';
                    }
                });
            },
            error: (err) => {
                this.ngZone.run(() => {
                    console.error('Verify error:', err);
                    this.state = 'error';
                });
            }
        });
    }

    reset() {
        this.codeInput = '';
        this.result = null;
        this.state = 'idle';
    }
}