import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from "../../_services/client.service";
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-nuevo-cliente-form',
  templateUrl: './nuevo-cliente-form.component.html',
  styleUrls: ['./nuevo-cliente-form.component.scss']
})
export class NuevoClienteFormComponent implements OnInit, OnChanges {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Input() currentClient: any = null;
  @Input() user: any = null;

  registerFormUser: FormGroup;
  submittedUser = false; // Propiedad para verificar si el formulario ha sido enviado
  clients = [];
  actionLabel = "Registrar"

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private clientService: ClientService,
    private spinner: NgxSpinnerService) {}


    get contactosFormArray() {
      return this.registerFormUser.get('contacts') as FormArray;
    }


  ngOnChanges(changes: SimpleChanges) {
      if (changes['currentClient'] && this.currentClient) {
        this.actionLabel = "Actualizar"
        this.registerFormUser.patchValue(this.currentClient);
        this.currentClient.contacts.forEach(contacto => {
          const contactoFormGroup = this.formBuilder.group({
            name: contacto.name,
            email: contacto.email,
            phone: contacto.phone,
          });
          this.contactosFormArray.push(contactoFormGroup);
        });
      }
    }

  ngOnInit() {
    console.log("Clientes    ", this.clients)
    this.registerFormUser = this.formBuilder.group({
      id: [0],
      name: ['', Validators.required],
      phone: [''], // teléfono es opcional
      address: [''],
      email: [''], // email es opcional
      activated: [true],
      description: [''],
      company_id: [Number(this.user.user.company_id)],
      contacts: this.formBuilder.array([this.createContactGroup()]), // quiero que sea una lista
    });
  }

  createContactGroup(): FormGroup {
    return this.formBuilder.group({
      name: [''],
      email: [''],
      phone: ['']
    });
  }

  get contacts(): FormArray {
    return this.registerFormUser.get('contacts') as FormArray;
  }

  addContact(): void {
    this.contacts.push(this.createContactGroup());
  }


  onSubmit() {
    if(this.actionLabel==='Registrar'){
      this.sendRegisterClient()
    }
    if(this.actionLabel==='Actualizar'){
      this.sendUpdateClient(this.currentClient.id)
    }
    
  }

  sendRegisterClient(){
    this.spinner.show();
    this.submittedUser = true; // Marca el formulario como enviado

    if (this.registerFormUser.invalid) {
      return; // Si el formulario es inválido, detiene la ejecución del método
    }

    this.clientService.register(this.registerFormUser.value)
    .subscribe(
      data => {
        if (data['created'] === true) {
          this.spinner.hide();
            this.clientService.clienteActualizado(data);
            this.mostrarMensajeExito('Cliente Creado Exitosamente')
            this.submittedUser = false;
            this.closeModalEvent.emit();
        }else{
          this.spinner.hide();
        }
      },
      error => {
        this.spinner.hide();
          this.mostrarMensajeError('Error al Crear Cliente');
          this.submittedUser = false;
    });
  }


  sendUpdateClient(idClient){
    this.spinner.show();
    this.submittedUser = true; // Marca el formulario como enviado

    if (this.registerFormUser.invalid) {
      return; // Si el formulario es inválido, detiene la ejecución del método
    }

    this.clientService.update(idClient, this.registerFormUser.value)
    .subscribe(
      data => {
        if (data['updated'] === true) {
          this.spinner.hide();
            this.clientService.clienteActualizado(data);
            this.mostrarMensajeExito('Cliente Actualizado Exitosamente')
            this.submittedUser = false;
            this.closeModalEvent.emit();
        }else{
          this.spinner.hide();
        }
      },
      error => {
        this.spinner.hide();
          this.mostrarMensajeError('Error al Crear Cliente');
          this.submittedUser = false;
    });
  }

  // Método para acceder fácilmente a los controles del formulario
  get u() { return this.registerFormUser.controls; }


  mostrarMensajeExito(mensaje: string) {
    this.toastr.success(mensaje, 'Exito');
  }

  mostrarMensajeError(mensaje: string) {
    this.toastr.error(mensaje, 'Error');
  }


}
