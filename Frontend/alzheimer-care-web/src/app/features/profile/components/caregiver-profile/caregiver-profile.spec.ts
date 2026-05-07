import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaregiverProfileComponent } from './caregiver-profile';

describe('CaregiverProfileComponent', () => {
  let component: CaregiverProfileComponent;
  let fixture: ComponentFixture<CaregiverProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()], imports: [CaregiverProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaregiverProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


