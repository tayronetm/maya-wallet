import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOperationModalComponent } from './add-operation-modal.component';

describe('AddOperationModalComponent', () => {
  let component: AddOperationModalComponent;
  let fixture: ComponentFixture<AddOperationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOperationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOperationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
