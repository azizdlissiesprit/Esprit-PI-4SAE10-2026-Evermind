import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileContainerComponent } from './profile-container';

describe('ProfileContainerComponent', () => {
  let component: ProfileContainerComponent;
  let fixture: ComponentFixture<ProfileContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
