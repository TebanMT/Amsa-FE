import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models/user';
import { Empresa } from '../_models/empresa';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(`http://localhost:4000/users`);
    }

    getById(id: number) {
        return this.http.get(`http://localhost:4000/users/${id}`);
    }

    register(user: any) {
        return this.http.post('https://4mjctue6h4.execute-api.us-east-1.amazonaws.com/prod/user', user);
    }


    update(user: User) {
        return this.http.put(`http://localhost:4000/users/${user.usuario_id}`, user);
    }

    delete(id: number) {
        return this.http.delete(`http://localhost:4000/users/${id}`);
    }
}