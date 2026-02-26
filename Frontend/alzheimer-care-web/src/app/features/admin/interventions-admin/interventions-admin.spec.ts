import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionsAdmin } from './interventions-admin';

describe('InterventionsAdmin', () => {
  let component: InterventionsAdmin;
  let fixture: ComponentFixture<InterventionsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionsAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterventionsAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
