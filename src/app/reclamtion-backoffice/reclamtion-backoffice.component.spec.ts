import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamtionBackofficeComponent } from './reclamtion-backoffice.component';

describe('ReclamtionBackofficeComponent', () => {
  let component: ReclamtionBackofficeComponent;
  let fixture: ComponentFixture<ReclamtionBackofficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReclamtionBackofficeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamtionBackofficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
