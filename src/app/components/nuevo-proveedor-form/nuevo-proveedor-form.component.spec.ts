import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoProveedorFormComponent } from './nuevo-proveedor-form.component';

describe('NuevoProveedorFormComponent', () => {
  let component: NuevoProveedorFormComponent;
  let fixture: ComponentFixture<NuevoProveedorFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NuevoProveedorFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevoProveedorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
