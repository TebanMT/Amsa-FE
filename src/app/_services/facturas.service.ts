import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacturasService {

  constructor(private http: HttpClient) { }

  private facturaSource = new BehaviorSubject<any>(null);
    facturaActualizada$ = this.facturaSource.asObservable();

    ventaActualizada(venta: any) {
        this.facturaSource.next(venta);
    }

    register(factura: any) {
        return this.http.post('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/bills', factura);
    }

    existFolio(idCompany, folio){
      return this.http.get('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/bills/exist?idCompany='+idCompany+'&folio='+folio)
    }

    getAll(idCompany){
      return this.http.get('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/bills?idCompany='+idCompany)
    }


    vincular(idCompany, id){
      return this.http.put('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/bills?idCompany='+idCompany+'&id='+id, {})
    }

}
