import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsAdmin } from './alerts-admin';

describe('AlertsAdmin', () => {
  let component: AlertsAdmin;
  let fixture: ComponentFixture<AlertsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertsAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
