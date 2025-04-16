import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAdminReclamationComponent } from './show-admin-reclamation.component';

describe('ShowAdminReclamationComponent', () => {
  let component: ShowAdminReclamationComponent;
  let fixture: ComponentFixture<ShowAdminReclamationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowAdminReclamationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowAdminReclamationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
