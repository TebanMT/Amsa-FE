import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class SuppliersService {
    constructor(private http: HttpClient) { }

    private supplierSource = new BehaviorSubject<any>(null);
    supplierActualizado$ = this.supplierSource.asObservable();

    supplierActualizado(supplier: any) {
        this.supplierSource.next(supplier);
    }

    getAll(idCompany) {
        return this.http.get<any[]>(`https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/suppliers?idCompany=`+idCompany);
    }

    register(supplier: any) {
        return this.http.post('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/suppliers', supplier);
    }

    update(idSupplier, supplier: any) {
        return this.http.put('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/suppliers/'+idSupplier, supplier);
    }

    deactivate(idSupplier: number){
        return this.http.delete('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/suppliers/'+idSupplier);
    }

    getCount(idCompany) {
        return this.http.get<any[]>(`https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/suppliers/count?idCompany=`+idCompany);
    }

}