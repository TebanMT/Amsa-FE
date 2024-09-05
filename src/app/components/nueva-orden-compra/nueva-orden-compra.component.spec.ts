import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaOrdenCompraComponent } from './nueva-orden-compra.component';

describe('NuevaOrdenCompraComponent', () => {
  let component: NuevaOrdenCompraComponent;
  let fixture: ComponentFixture<NuevaOrdenCompraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NuevaOrdenCompraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaOrdenCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
