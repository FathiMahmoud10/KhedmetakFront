import { TestBed } from '@angular/core/testing';

import { GovServicesService } from './gov-services-service';

describe('GovServices', () => {
  let service: GovServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GovServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
