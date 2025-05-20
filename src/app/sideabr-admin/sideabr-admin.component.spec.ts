import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideabrAdminComponent } from './sideabr-admin.component';

describe('SideabrAdminComponent', () => {
  let component: SideabrAdminComponent;
  let fixture: ComponentFixture<SideabrAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideabrAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideabrAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
