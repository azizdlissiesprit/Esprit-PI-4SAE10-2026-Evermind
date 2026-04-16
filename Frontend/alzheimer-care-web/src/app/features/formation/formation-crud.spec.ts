import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormationService } from './services/formation.service';

describe('Formation CRUD - FormationService', () => {
  let service: FormationService;
  let httpMock: HttpTestingController;
  const BASE = 'http://localhost:9086/formation';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FormationService],
    });
    service = TestBed.inject(FormationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getProgrammes should return programmes', () => {
    const mock = [{ id: 1, titre: 'Test', theme: 'Santé', description: '' }];
    service.getProgrammes().subscribe((data) => expect(data).toEqual(mock));
    const req = httpMock.expectOne(`${BASE}/programmes`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('createProgramme should POST', () => {
    const p = { titre: 'Nouveau', theme: 'Alzheimer', description: 'Desc' };
    service.createProgramme(p).subscribe((data) => expect(data.titre).toBe('Nouveau'));
    const req = httpMock.expectOne(`${BASE}/programmes`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...p, id: 1 });
  });

  it('getModules should return modules', () => {
    const mock = [{ id: 1, titre: 'Module 1', type: 'Video', dureeEstimee: 10 }];
    service.getModules().subscribe((data) => expect(data).toEqual(mock));
    const req = httpMock.expectOne(`${BASE}/modules`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('createModule should POST with programmeId', () => {
    const m = { programmeId: 1, titre: 'Mod', type: 'Video', contenu: '', dureeEstimee: 10 };
    service.createModule(m).subscribe((data) => expect(data.titre).toBe('Mod'));
    const req = httpMock.expectOne(`${BASE}/modules`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.programmeId).toBe(1);
    req.flush({ ...m, id: 1 });
  });

  it('createRessource should POST with moduleId and url', () => {
    const r = { moduleId: 1, url: 'https://youtube.com/watch?v=xxx', typeFichier: 'video' };
    service.createRessource(r).subscribe((data) => expect(data.url).toBe(r.url));
    const req = httpMock.expectOne(`${BASE}/ressources`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.moduleId).toBe(1);
    expect(req.request.body.url).toContain('youtube');
    req.flush({ ...r, id: 1 });
  });

  it('getQuizList should return quiz list', () => {
    const mock = [{ id: 1, titre: 'Quiz 1', seuilReussite: 70 }];
    service.getQuizList().subscribe((data) => expect(data).toEqual(mock));
    const req = httpMock.expectOne(`${BASE}/quiz`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('createQuiz should POST', () => {
    const q = { moduleId: 1, titre: 'Quiz', seuilReussite: 70 };
    service.createQuiz(q).subscribe((data) => expect(data.titre).toBe('Quiz'));
    const req = httpMock.expectOne(`${BASE}/quiz`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...q, id: 1 });
  });
});
