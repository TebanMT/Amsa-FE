import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SuppliersService } from "../../_services/suppliers.service";
import { AuthenticationService } from '../../_services/authentication.service';
import { LowerCasePipe } from '@angular/common';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-nuevo-proveedor-form',
  templateUrl: './nuevo-proveedor-form.component.html',
  styleUrls: ['./nuevo-proveedor-form.component.scss']
})
export class NuevoProveedorFormComponent implements OnInit {

  @Output() closeModalEvent = new EventEmitter<void>();
  @Input() currentSupplier: any = null;

  registerFormSuppliers: FormGroup;
  submittedSuppliers = false; // Propiedad para verificar si el formulario ha sido enviado
  suppliers = [];
  actionLabel = "Registrar"
  currentUser: any;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private authenticationService: AuthenticationService,
    private supplierService: SuppliersService,
    private spinner: NgxSpinnerService) {
      this.currentUser = this.authenticationService.currentUserValue;
    }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentSupplier'] && this.currentSupplier) {
      this.actionLabel = "Actualizar"
      this.registerFormSuppliers.patchValue(this.convertKeysToCamelCase(this.currentSupplier));
    }
  }

  ngOnInit() {
    this.registerFormSuppliers = this.formBuilder.group({
      id: [0],
      name: ['', Validators.required],
      phone: [''], // teléfono es opcional
      address: [''],
      email: [''], // email es opcional
      activated: [true],
      description: [''],
      executive: [''],
      category: ['', Validators.required],
      company_id:[Number(this.currentUser.user.company_id)]
    });
  }

  // Método para acceder fácilmente a los controles del formulario
  get u() { return this.registerFormSuppliers.controls; }

  onSubmit() {
    if(this.actionLabel==='Registrar'){
      this.sendRegisterSupplier()
    }
    if(this.actionLabel==='Actualizar'){
      this.sendUpdateSupplier(1)
    }
    
  }

  sendRegisterSupplier(){
    this.spinner.show();
    this.submittedSuppliers = true; // Marca el formulario como enviado

    if (this.registerFormSuppliers.invalid) {
      return; // Si el formulario es inválido, detiene la ejecución del método
    }

    this.supplierService.register(this.registerFormSuppliers.value)
    .subscribe(
      data => {
        if (data['created'] === true) {
          this.spinner.hide();
          this.supplierService.supplierActualizado(data);
          this.mostrarMensajeExito('Proveedor Creado Exitosamente')
          this.submittedSuppliers = false;
          this.closeModalEvent.emit();
          this.registerFormSuppliers.reset();
        }else{
          this.spinner.hide();
        }
      },
      error => {
        this.spinner.hide();
        this.mostrarMensajeError('Error al Crear Proveedor');
        this.submittedSuppliers = false;
    });
  }


  sendUpdateSupplier(idSupplier){
    this.spinner.show();
    this.submittedSuppliers = true; // Marca el formulario como enviado

    if (this.registerFormSuppliers.invalid) {
      return; // Si el formulario es inválido, detiene la ejecución del método
    }

    this.supplierService.update(idSupplier, this.registerFormSuppliers.value)
    .subscribe(
      data => {
        if (data['updated'] === true) {
          this.spinner.hide();
          this.supplierService.supplierActualizado(data);
          this.mostrarMensajeExito('Proveedor Actualizado Exitosamente')
          this.submittedSuppliers = false;
          this.closeModalEvent.emit();
        }else{
          this.spinner.hide();
        }
      },
      error => {
        this.spinner.hide();
        this.mostrarMensajeError('Error al Crear Proveedor');
        this.submittedSuppliers = false;
    });
  }

  mostrarMensajeExito(mensaje: string) {
    this.toastr.success(mensaje, 'Exito');
  }

  mostrarMensajeError(mensaje: string) {
    this.toastr.error(mensaje, 'Error');
  }




pascalCaseToCamelCase(s: string): string {
  // Si la cadena está vacía o no es un PascalCase, devolver la cadena original
  if (!s) return s;
  if (s=="ID") return "id";
  // Convertir la primera letra a minúscula y dejar el resto de la cadena igual
  return s.charAt(0).toLowerCase() + s.slice(1);
}

// Función para convertir las llaves de un objeto de PascalCase a camelCase
convertKeysToCamelCase(obj: any): any {
  // Crear un nuevo objeto para almacenar las llaves convertidas
  const newObj: any = {};

  // Iterar sobre cada llave del objeto original
  Object.keys(obj).forEach((key) => {
    // Convertir la llave de PascalCase a camelCase
    const newKey = this.pascalCaseToCamelCase(key);
    // Verificar si el valor asociado a la llave es también un objeto
    // para aplicar la conversión de forma recursiva
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[newKey] = this.convertKeysToCamelCase(obj[key]);
    } else {
      // Asignar el valor al nuevo objeto con la llave convertida
      newObj[newKey] = obj[key];
    }
  });

  return newObj;
}


}
