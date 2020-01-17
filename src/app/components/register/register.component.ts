import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

import { AlertService } from '../../_services/alert.service';
import { UserService } from "../../_services/user.service";
import { AuthenticationService } from "../../_services/authentication.service";

@Component({templateUrl: 'register.component.html'})
export class RegisterComponent implements OnInit {
    registerFormEmpresa: FormGroup;
    registerFormUser: FormGroup;
    loading = false;
    submittedEmpresa = false;
    submittedUser = false;
    showUserForm = false;


    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService,
        private componentFactoryResolver: ComponentFactoryResolver
    ) { 
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) { 
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        let element = document.getElementById('body')
        element.className = "hold-transition register-page"
        this.registerFormEmpresa = this.formBuilder.group({
            empresa_id : [''],
            empresa_nombre: ['', Validators.required],
            empresa_enterprise_user: [''],
            empresa_correo: ['', Validators.required],
            empresa_pais: ['', Validators.required],
            empresa_estado: ['', Validators.required],
            empresa_direccion: ['', Validators.required],
        });
        this.registerFormUser = this.formBuilder.group({
            usuario_id : ['',],
            usuario_empresa_id : ['',],
            usuario_nombre: ['', Validators.required],
            usuario_apellido_p: ['', Validators.required],
            usuario_apellido_m: ['',],
            usuario_correo: ['',],
            usuario_nombre_usuario: ['', Validators.required],
            usuario_password: ['', [Validators.required, Validators.minLength(6)]],
            usuario_retry_password: ['', [Validators.required, Validators.minLength(6)]],
            usuario_rol_id: [1,],
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.registerFormEmpresa.controls; }
    get u() { return this.registerFormUser.controls; }

    onSubmit(){
        this.submittedUser = true;
        // stop here if form is invalid

        if (this.registerFormUser.invalid) {
            return;
        }
        if (this.registerFormUser.value.usuario_password != this.registerFormUser.value.usuario_retry_password) {
            this.alertService.error('Las contraseñas no coenciden', true);
            return;
        }
        delete this.registerFormUser.value.usuario_retry_password

        this.loading = true;
        this.userService.register(this.registerFormUser.value, this.registerFormEmpresa.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Registration successful', true);
                    this.router.navigate(['/login']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });

    }

    changeUserForm() {
        this.submittedEmpresa = true;
        // stop here if form is invalid
        if (this.registerFormEmpresa.invalid) {
            return;
        }
        this.showUserForm = !this.showUserForm
    }

    changeEmpresaForm(){
        this.showUserForm = !this.showUserForm;
    }
}