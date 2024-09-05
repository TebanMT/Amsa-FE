import { TestBed } from '@angular/core/testing';

import { OrdenesCompraService } from './ordenes-compra.service';

describe('OrdenesCompraService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrdenesCompraService = TestBed.get(OrdenesCompraService);
    expect(service).toBeTruthy();
  });
});
