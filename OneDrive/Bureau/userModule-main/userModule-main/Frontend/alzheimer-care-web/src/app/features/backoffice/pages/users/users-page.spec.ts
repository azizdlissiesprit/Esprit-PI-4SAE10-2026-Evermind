import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserType } from '../../../../core/models/enums';
import { UsersPageComponent } from './users-page';

describe('UsersPageComponent integration', () => {
  let fixture: ComponentFixture<UsersPageComponent>;
  let component: UsersPageComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersPageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads users and stats on init and renders data', () => {
    fixture.detectChanges();

    const usersReq = httpMock.expectOne((req) => req.url === '/users');
    expect(usersReq.request.method).toBe('GET');
    usersReq.flush([
      {
        userId: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phoneNumber: '111',
        userType: UserType.ADMIN,
        active: true,
        banned: false,
        createdAt: '2026-04-23T10:00:00',
        lastLogin: '2026-04-23T11:00:00'
      }
    ]);

    const statsReq = httpMock.expectOne('/users/stats');
    expect(statsReq.request.method).toBe('GET');
    statsReq.flush({
      totalUsers: 1,
      activeUsers: 1,
      bannedUsers: 0,
      admins: 1,
      aidants: 0,
      medecins: 0,
      responsables: 0
    });

    fixture.detectChanges();

    expect(component.users.length).toBe(1);
    expect(component.stats.totalUsers).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('jane@example.com');
  });

  it('sends role filter in request params', () => {
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url === '/users').flush([]);
    httpMock.expectOne('/users/stats').flush({
      totalUsers: 0,
      activeUsers: 0,
      bannedUsers: 0,
      admins: 0,
      aidants: 0,
      medecins: 0,
      responsables: 0
    });

    component.onRoleChange(UserType.ADMIN);

    const filteredReq = httpMock.expectOne(
      (req) => req.url === '/users' && req.params.get('userType') === UserType.ADMIN
    );
    expect(filteredReq.request.method).toBe('GET');
    filteredReq.flush([]);
  });
});
