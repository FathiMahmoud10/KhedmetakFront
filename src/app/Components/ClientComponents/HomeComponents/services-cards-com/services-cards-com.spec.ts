import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesCardsCom } from './services-cards-com';

describe('ServicesCardsCom', () => {
  let component: ServicesCardsCom;
  let fixture: ComponentFixture<ServicesCardsCom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesCardsCom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesCardsCom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
