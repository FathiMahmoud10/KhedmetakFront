import { TestBed } from '@angular/core/testing';

import { CategoryAPI } from './category-api';

describe('CategoryAPI', () => {
  let service: CategoryAPI;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryAPI);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
