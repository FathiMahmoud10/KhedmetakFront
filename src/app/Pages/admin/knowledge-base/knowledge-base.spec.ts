import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBase } from './knowledge-base';

describe('KnowledgeBase', () => {
  let component: KnowledgeBase;
  let fixture: ComponentFixture<KnowledgeBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeBase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
