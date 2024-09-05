import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ClientService {
    constructor(private http: HttpClient) { }

    private clienteSource = new BehaviorSubject<any>(null);
    clienteActualizado$ = this.clienteSource.asObservable();

    clienteActualizado(cliente: any) {
        this.clienteSource.next(cliente);
    }

    getAll(idCompany: number) {
        return this.http.get<any[]>(`https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/client?idCompany=`+idCompany);
    }

    register(client: any) {
        return this.http.post('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/client', client);
    }

    update(idClient, client: any) {
        return this.http.put('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/client/'+idClient, client);
    }

    deactivate(idClient: number){
        return this.http.delete('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/client/'+idClient);
    }

    getCount(idCompany: number) {
        return this.http.get<any[]>(`https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/client/count?idCompany=`+idCompany);
    }

    getAllWithBills(idCompany: number) {
        return this.http.get<any[]>(`https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/client?include=bills&idCompany=`+idCompany);
    }

}