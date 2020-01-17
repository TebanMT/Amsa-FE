import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { User } from '../../_models/user';
import { UserService } from '../../_services/user.service';
import { AuthenticationService } from "../../_services/authentication.service";
import { Router } from '@angular/router';

import { AlertService, } from "../../_services/alert.service";

@Component({
  selector: 'app-register-user-content',
  templateUrl: './register-user-content.component.html',
  styles: []
})
export class RegisterUserContentComponent implements OnInit, OnDestroy {
  currentUser: User;
  currentUserSubscription: Subscription;
  users: User[] = [];
  registerFormUser: FormGroup;
  usuario_check:Boolean = false;
  admin_check:Boolean = false;
  submittedUser = false;
  loading = false;

  constructor(private authenticationService: AuthenticationService,
    private userService: UserService, private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
        });
    }

    ngOnInit() {
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
          usuario_rol_id: ['',],
      });
  }

  onSubmit(){
    this.submittedUser = true;
        // stop here if form is invalid

    if (this.registerFormUser.invalid) {
      return;
    }
    this.registerFormUser.value.usuario_empresa_id = this.currentUser.Empresa.id;
    if (this.registerFormUser.value.usuario_password != this.registerFormUser.value.usuario_retry_password) {
      this.alertService.error('Las contraseñas no coenciden', true);
      return;
    }
    delete this.registerFormUser.value.usuario_retry_password

    if(this.addUsuarioRol() == undefined){
      this.loading = true;
        this.userService.register(this.registerFormUser.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.alertService.success('Registration successful', true);
                    this.loading = false;
                    this.registerFormUser.reset;
                    //this.router.navigate(['/login']);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
  }

  addUsuarioRol(){
    if (this.usuario_check == true && this.admin_check == true) {
      this.registerFormUser.value.usuario_rol_id = 1;
    }else{
      if (this.usuario_check == true) {
        this.registerFormUser.value.usuario_rol_id = 3;
      }else{
        if (this.admin_check == true) {
          this.registerFormUser.value.usuario_rol_id = 2;
        }else{
          this.alertService.error("debe asignar un tipo de usuario");
          return false;
        }
      }
    }
  }

  usuarioChange(type){
      this.usuario_check = !this.usuario_check;
  }

  adminChange(type){
    this.admin_check = !this.admin_check;
  }

  // convenience getter for easy access to form fields
  get u() { return this.registerFormUser.controls; }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

}
