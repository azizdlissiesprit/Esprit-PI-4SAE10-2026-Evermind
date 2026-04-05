import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaregiverProfile } from './caregiver-profile';

describe('CaregiverProfile', () => {
  let component: CaregiverProfile;
  let fixture: ComponentFixture<CaregiverProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaregiverProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaregiverProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
