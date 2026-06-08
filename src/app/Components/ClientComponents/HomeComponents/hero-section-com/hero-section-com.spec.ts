import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroSectionCom } from './hero-section-com';

describe('HeroSectionCom', () => {
  let component: HeroSectionCom;
  let fixture: ComponentFixture<HeroSectionCom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSectionCom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroSectionCom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
