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

    register(user?: User, empresa?: Empresa);
    register(user: User, empresa: Empresa) {
        var data_to_send = user || empresa
        if (empresa != null && user != null) {
            data_to_send = Object.assign(user, empresa);
        }
        return this.http.post('http://localhost:3000/users/register', data_to_send);
    }


    update(user: User) {
        return this.http.put(`http://localhost:4000/users/${user.usuario_id}`, user);
    }

    delete(id: number) {
        return this.http.delete(`http://localhost:4000/users/${id}`);
    }
}