import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertAdminListComponent } from './alerts-admin';

describe('AlertAdminListComponent', () => {
  let component: AlertAdminListComponent;
  let fixture: ComponentFixture<AlertAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()], imports: [AlertAdminListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertAdminListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


