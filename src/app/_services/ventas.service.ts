import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(private http: HttpClient) { }

  private ventaSource = new BehaviorSubject<any>(null);
    ventaActualizado$ = this.ventaSource.asObservable();

    ventaActualizada(venta: any) {
        this.ventaSource.next(venta);
    }

    register(venta: any) {
        return this.http.post('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/sales', venta);
    }

}
