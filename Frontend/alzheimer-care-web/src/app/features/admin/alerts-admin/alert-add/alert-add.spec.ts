import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertAdd } from './alert-add';

describe('AlertAdd', () => {
  let component: AlertAdd;
  let fixture: ComponentFixture<AlertAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
