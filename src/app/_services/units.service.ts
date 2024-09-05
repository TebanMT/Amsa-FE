import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {

  constructor(private http: HttpClient) { }

  getAll(idCompany) {
    return this.http.get<any[]>(`https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/units?idCompany=`+idCompany);
  }

}

