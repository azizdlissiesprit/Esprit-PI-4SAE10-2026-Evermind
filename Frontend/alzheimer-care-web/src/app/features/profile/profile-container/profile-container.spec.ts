import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileContainer } from './profile-container';

describe('ProfileContainer', () => {
  let component: ProfileContainer;
  let fixture: ComponentFixture<ProfileContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
