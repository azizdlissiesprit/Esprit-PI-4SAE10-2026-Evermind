import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativeProfileComponent } from './relative-profile';

describe('RelativeProfileComponent', () => {
  let component: RelativeProfileComponent;
  let fixture: ComponentFixture<RelativeProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelativeProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelativeProfileComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
