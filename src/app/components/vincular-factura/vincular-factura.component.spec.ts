import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VincularFacturaComponent } from './vincular-factura.component';

describe('VincularFacturaComponent', () => {
  let component: VincularFacturaComponent;
  let fixture: ComponentFixture<VincularFacturaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VincularFacturaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VincularFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
