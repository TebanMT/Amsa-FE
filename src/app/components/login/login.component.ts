import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '../../_services/authentication.service';
import { UserService } from '../../_services/user.service';
import { AlertService, } from "../../_services/alert.service";

@Component({
    selector: 'login',
    templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss']})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    submittedUser = false;
    returnUrl: string;
    registerFormUser: FormGroup;
    activeTab: 'login' | 'register' = 'login';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService,
        private toastr: ToastrService,
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        let element = document.getElementById('body')
        element.className = "hold-transition login-page"
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.registerFormUser = this.formBuilder.group({
            name            : ['', Validators.required],
            last_name       : ['',],
            second_last_name: ['',],
            username        : ['', Validators.required],
            phone_number    : ['',  Validators.required],
            company_name    : ['',  Validators.required],
            password        : ['',  Validators.required],
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }
    get u() { return this.registerFormUser.controls; }

    async onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    console.log("data from login = ", data)
                    if (data.message) {
                        this.toastr.error(data.message, 'Error');
                        this.loading = false;
                        this.registerFormUser.reset()
                    }else{
                        this.router.navigate([this.returnUrl]);
                    }
                },
                error => {
                    this.toastr.error("Error de Autenticación", 'Error');
                    this.loading = false;
                });
    }


    setActiveTab(tab: 'login' | 'register'): void {
        this.activeTab = tab;
    }

    async registerUser(){
        this.submittedUser = true;

        // stop here if form is invalid
        if (this.registerFormUser.invalid) {
            return;
        }

        this.loading = true;
        this.userService.register(this.registerFormUser.value)
            .pipe(first())
            .subscribe(
                data => {
                    console.log("data from register = ", data)
                    if (data['created']) {
                        this.toastr.success("Usuario Creado con Éxito. Puede iniciar Sesíon", 'Éxito');
                        this.loading = false;
                        this.activeTab ='login'
                        this.registerFormUser.reset()
                        this.submittedUser = false;
                    }else{
                        this.router.navigate([this.returnUrl]);
                        this.submittedUser = false;
                        this.loading = false;
                    }
                },
                error => {
                    this.toastr.error("Error al crear el usuario", 'Error');
                    this.loading = false;
                    this.submittedUser = false;
                });
    }

}