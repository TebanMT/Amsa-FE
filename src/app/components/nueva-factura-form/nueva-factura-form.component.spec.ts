import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaFacturaFormComponent } from './nueva-factura-form.component';

describe('NuevaFacturaFormComponent', () => {
  let component: NuevaFacturaFormComponent;
  let fixture: ComponentFixture<NuevaFacturaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NuevaFacturaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaFacturaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
