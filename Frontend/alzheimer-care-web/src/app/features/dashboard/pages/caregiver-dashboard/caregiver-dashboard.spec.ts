import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaregiverDashboardComponent } from './caregiver-dashboard';

describe('CaregiverDashboardComponent', () => {
  let component: CaregiverDashboardComponent;
  let fixture: ComponentFixture<CaregiverDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()], imports: [CaregiverDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaregiverDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


