import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowWorkSection } from './how-work-section';

describe('HowWorkSection', () => {
  let component: HowWorkSection;
  let fixture: ComponentFixture<HowWorkSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowWorkSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HowWorkSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
