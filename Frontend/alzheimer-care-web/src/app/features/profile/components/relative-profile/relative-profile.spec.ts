import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativeProfile } from './relative-profile';

describe('RelativeProfile', () => {
  let component: RelativeProfile;
  let fixture: ComponentFixture<RelativeProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelativeProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelativeProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
