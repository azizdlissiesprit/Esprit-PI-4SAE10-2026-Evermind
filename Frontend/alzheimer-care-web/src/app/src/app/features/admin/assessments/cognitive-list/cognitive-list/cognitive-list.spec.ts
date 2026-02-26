import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CognitiveList } from './cognitive-list';

describe('CognitiveList', () => {
  let component: CognitiveList;
  let fixture: ComponentFixture<CognitiveList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CognitiveList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CognitiveList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
