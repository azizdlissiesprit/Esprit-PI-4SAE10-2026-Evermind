import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsAdmin } from './settings-admin';

describe('SettingsAdmin', () => {
  let component: SettingsAdmin;
  let fixture: ComponentFixture<SettingsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
