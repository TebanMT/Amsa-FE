import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) { }

    private prodcutoSource = new BehaviorSubject<any>(null);
    productoActualizado$ = this.prodcutoSource.asObservable();

    productoActualizado(supplier: any) {
        this.prodcutoSource.next(supplier);
    }

    getAll(idCompany, idType) {
        return this.http.get<any[]>(`https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/products?idCompany=`+idCompany+`&idType=`+idType);
    }

    register(product: any) {
        return this.http.post('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/products', product);
    }

    update(idProduct, product: any) {
        return this.http.put('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/products/'+idProduct, product);
    }

    deactivate(idSupplier: number){
        return this.http.delete('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/products/'+idSupplier);
    }

    getCount(idCompany) {
        return this.http.get<any[]>(`https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/products/count?idCompany=`+idCompany);
    }

}
