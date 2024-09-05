import { Component, OnInit, OnDestroy, ViewChild, Renderer2, ElementRef   } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { User } from '../../_models/user';
import { UserService } from '../../_services/user.service';
import { ClientService } from "../../_services/client.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { Router } from '@angular/router';

import { AlertService, } from "../../_services/alert.service";
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-register-user-content',
  templateUrl: './register-user-content.component.html',
  styles: []
})
export class RegisterUserContentComponent implements OnInit, OnDestroy {

  @ViewChild('nuevoClienteModal', { static: false }) nuevoClienteModal: any;
  @ViewChild('detalleModal', { static: false }) detalleModal: any;
  @ViewChild('productosModal', { static: false }) productosModal: any;
  @ViewChild('editarModal', { static: false }) editarModal: any;

  @ViewChild('eliminarClienteModal',  { static: false }) eliminarClienteModal: ElementRef;
  clienteSeleccionado: any; // Asume que tienes un tipo para tu cliente


  currentUser: User;
  currentUserSubscription: Subscription;
  users: User[] = [];
  clients: any[] = [];
  registerFormUser: FormGroup;
  usuario_check:Boolean = false;
  admin_check:Boolean = false;
  submittedUser = false;
  loading = false;

  productosDelCliente = [
    { nombre: 'Producto 1', cantidad: 2, precio: 150.00, fechaVenta: new Date(2021, 0, 15) },
    { nombre: 'Producto 2', cantidad: 1, precio: 200.00, fechaVenta: new Date(2021, 2, 22) },
    { nombre: 'Producto 3', cantidad: 3, precio: 99.99, fechaVenta: new Date(2021, 5, 30) },
    // Más productos...
  ];

  client = {
    id: 0,
    name: "",
    phone:"",
    email: "",
    address: "",
    description: "",
    activated: false,
    contacts: []
  };


  constructor(private authenticationService: AuthenticationService,
    private userService: UserService, private formBuilder: FormBuilder,
    private router: Router, private renderer: Renderer2,
    private alertService: AlertService, private toastr: ToastrService,
    private clientService: ClientService, private cdRef: ChangeDetectorRef,
    private spinner: NgxSpinnerService) {
        this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
            this.currentUser = user;
            this.loadData()
        });

        this.clientService.clienteActualizado$.subscribe(cliente => {
          if (cliente) {
            this.loadData()
          }
        });
    }

    loadData() {
      this.spinner.show();
      this.clientService.getAll(Number(this.currentUser['user'].company_id))
        .subscribe(
          data => {
            if (data) {
              this.clients = data.filter(client => client.activated && client.activated === true);
            }
            this.spinner.hide();
          },
          error => {
            this.spinner.hide();
            this.mostrarMensajeError('Error al Obtener los Clientes');
            this.submittedUser = false;
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

  closeModal() {
    this.renderer.setStyle(this.nuevoClienteModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();

  }

  removeModalBackdrop() {
    const backdrops = document.getElementsByClassName('modal-backdrop') as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < backdrops.length; i++) {
      backdrops[i].style.display = 'none';
    }
    document.body.classList.remove('modal-open'); // Restaura el desplazamiento (scroll) del body
  }

  cerrarModalProductos() {
    this.renderer.setStyle(this.productosModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();
  }

  cerrarModalDetalle() {
    this.renderer.setStyle(this.detalleModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();
  }

  closeModalEditar() {
    this.renderer.setStyle(this.editarModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();

  }

  abrirModalEliminar(cliente) {
    this.clienteSeleccionado = cliente;
    this.eliminarClienteModal.nativeElement.style.display = 'block';
  }

  cerrarModalEliminar() {
    this.renderer.setStyle(this.eliminarClienteModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();
  }

  confirmarEliminacion() {
    this.spinner.show();
    this.clientService.deactivate(this.client.id)
    .pipe(first())
    .subscribe(
      data => {
        if (data['deactivate']) {
          this.loadData();
          this.mostrarMensajeExito('Cliente Eliminado Exitosamente');
          this.cerrarModalEliminar();
          this.loading = false;
        }else{
          this.loadData()
          this.mostrarMensajeError("Error al Eliminar el Cliente");
          this.cerrarModalEliminar();
        }
        this.spinner.hide();
      },
      error => {
        this.loadData()
        this.mostrarMensajeError("Error al Eliminar el Cliente");
        this.cerrarModalEliminar();
        this.loading = false;
      });
  }

  mostrarMensajeExito(mensaje: string) {
    this.toastr.success(mensaje, 'Exito');
  }

  mostrarMensajeError(mensaje: string) {
    this.toastr.error(mensaje, 'Error');
  }

  setClient(client: any){
    console.log(client)
    this.client = client
  }


}
