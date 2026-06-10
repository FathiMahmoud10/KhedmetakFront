import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterCom } from './footer-com';

describe('FooterCom', () => {
  let component: FooterCom;
  let fixture: ComponentFixture<FooterCom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterCom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterCom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
