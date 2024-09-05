import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaVentaFormComponent } from './nueva-venta-form.component';

describe('NuevaVentaFormComponent', () => {
  let component: NuevaVentaFormComponent;
  let fixture: ComponentFixture<NuevaVentaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NuevaVentaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaVentaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
