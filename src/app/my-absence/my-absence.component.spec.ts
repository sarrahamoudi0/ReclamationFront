import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAbsenceComponent } from './my-absence.component';

describe('MyAbsenceComponent', () => {
  let component: MyAbsenceComponent;
  let fixture: ComponentFixture<MyAbsenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyAbsenceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAbsenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
