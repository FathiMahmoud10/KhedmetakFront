import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteService } from './delete-service';

describe('DeleteService', () => {
  let component: DeleteService;
  let fixture: ComponentFixture<DeleteService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
