import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorProfileComponent } from './doctor-profile';

describe('DoctorProfileComponent', () => {
  let component: DoctorProfileComponent;
  let fixture: ComponentFixture<DoctorProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
