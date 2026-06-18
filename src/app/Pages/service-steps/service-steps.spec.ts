import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

import { ServiceSteps } from './service-steps';

describe('ServiceSteps', () => {
  let component: ServiceSteps;
  let fixture: ComponentFixture<ServiceSteps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceSteps],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (_: string) => '1' } }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceSteps);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
