import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdenesCompraService {

  constructor(private http: HttpClient) { }

  private ordenesCompraSource = new BehaviorSubject<any>(null);
    ordenActualizada$ = this.ordenesCompraSource.asObservable();

    ordenCompraActualizada(venta: any) {
        this.ordenesCompraSource.next(venta);
    }

    register(orden: any) {
        return this.http.post('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/purchaseOrder', orden);
    }

    getAll(idCompany){
      return this.http.get('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/purchaseOrder?idCompany='+idCompany)
    }

    existFolio(idCompany, folio){
      return this.http.get('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/purchaseOrder/exist?idCompany='+idCompany+'&folio='+folio)
    }

    vincular(idCompany, id){
      return this.http.put('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/purchaseOrder?idCompany='+idCompany+'&id='+id, {})
    }

}
