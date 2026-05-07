import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertAddComponent } from './alert-add';

describe('AlertAddComponent', () => {
  let component: AlertAddComponent;
  let fixture: ComponentFixture<AlertAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()], imports: [AlertAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertAddComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


