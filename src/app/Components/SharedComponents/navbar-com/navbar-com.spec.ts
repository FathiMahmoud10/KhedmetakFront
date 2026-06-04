import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarCom } from './navbar-com';

describe('NavbarCom', () => {
  let component: NavbarCom;
  let fixture: ComponentFixture<NavbarCom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarCom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarCom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
