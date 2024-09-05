import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductsService } from "../../_services/products.service";
import { CategoriesService } from "../../_services/categories.service";
import { AuthenticationService } from '../../_services/authentication.service';
import { LowerCasePipe } from '@angular/common';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-nuevo-producto-form',
  templateUrl: './nuevo-producto-form.component.html',
  styleUrls: ['./nuevo-producto-form.component.scss']
})
export class NuevoProductoFormComponent implements OnInit {

  @Output() closeModalEvent = new EventEmitter<void>();
  @Input() currentProducto: any = null;
  @Input() categories: any = [];
  @Input() productos: any = [];
  @Input() units: any = [];
  @Input() idType: number;

  registerFormProduct: FormGroup;
  submittedProduct = false; // Propiedad para verificar si el formulario ha sido enviado
  actionLabel = "Registrar"
  currentUser: any;
  iva: number = 16.0;
  pp="Selecciona o crea una categoría"
  ppUnit="Selecciona o crea una unidad"
  isDuplicate = false

  porcentajesIVA = [];
  ivaSeleccionado: number = 16; // Inicializa con el valor por defecto
  categorySelect: any;
  unitsSelect: any;


  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private authenticationService: AuthenticationService,
    private productService: ProductsService,
    private spinner: NgxSpinnerService) {
      this.currentUser = this.authenticationService.currentUserValue;
      for (let i = 0; i < 101; i++) {
        this.porcentajesIVA[i]=({valor:i, texto:i.toString()+'%'})
        
      }
    }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentProducto'] && this.currentProducto) {
      let product = this.convertKeysToCamelCase(this.currentProducto);
      this.categorySelect = this.categories.find(c => c.ID == product.id_category);
      this.unitsSelect = this.units.find(c => c.ID == product.unit_id);
      this.actionLabel = "Actualizar"
      this.registerFormProduct.patchValue(product);
      this.pp=''
      this.ppUnit=''
      this.ivaSeleccionado = product.iva_percentage;
    }
  }

  ngOnInit() {
    this.registerFormProduct = this.formBuilder.group({
      id          : [0],
      clave       : ['', Validators.required],
      name        : ['', Validators.required],
      unit        : ['',  Validators.required],
      costo       : ['', Validators.required],
      precio      : ['', Validators.required], // email es opcional
      activated   : [true],
      nota        : [''],
      category    : ['', Validators.required],
      company_id  :[Number(this.currentUser.user.company_id)],
      type_id     : this.idType,
      iva_percentage: [this.ivaSeleccionado],
      category_id :  this.formBuilder.group({
        id          : [0],
        name        : ['', Validators.required],
        description : [''],
        activate    : [true],
        company_id  : ['', Validators.required]
      }),
      unit_id :  this.formBuilder.group({
        id          : [0],
        name        : ['', Validators.required],
        description : [''],
        activate    : [true],
        company_id  : ['', Validators.required]
      })
    });
  }

  checkClave(){
    let found = this.productos.find(p => p.Clave == this.registerFormProduct.controls['clave'].value && p.Type_id == this.idType);
    if (found !== undefined){
      if (this.currentProducto !== null && found.Clave == this.currentProducto.Clave){
        this.isDuplicate = false
      }else{
        this.isDuplicate = true
      }
    }else{
      this.isDuplicate = false
    }
  }

  // Método para acceder fácilmente a los controles del formulario
  get u() { return this.registerFormProduct.controls; }

  get precioTotal() {
    if (this.registerFormProduct.controls['precio'].value === ''){
      return null
    }
    const iva = ((Number(this.registerFormProduct.controls['precio'].value) * this.ivaSeleccionado)/100.00)
    const total = iva + Number(this.registerFormProduct.controls['precio'].value)
    if (total == 0 ){
      return null
    }else{
      return total
    }
  }

  get precioIva(){
    if (this.registerFormProduct.controls['precio'].value === ''){
      return null
    }
    const iva = ((Number(this.registerFormProduct.controls['precio'].value) * this.ivaSeleccionado)/100.00)
    if (iva == 0 && this.registerFormProduct.controls['precio'].value === null){
      return null
    }else{
      return iva
    }
  }

  onSubmit() {
    if(this.actionLabel==='Registrar'){
      this.sendRegisterProduct()
    }
    if(this.actionLabel==='Actualizar'){
      this.sendUpdateProduct(1)
    }
    
  }

  onChange(event) {
    // Aquí puedes verificar si el evento incluye una etiqueta recién agregada
    console.log(event)
    this.categorySelect = event;
    if (event == undefined || event['Name']==''){
      this.pp="Selecciona o crea una categoría"
    }else{
      this.pp=null;
    }
    // Implementa tu lógica específica para manejar el nuevo valor aquí
  }

  addTagFn(name) {
    const newTag = { ID: 0, Name: name };
    return newTag;
  }



  onChangeUnitSelect(event) {
    console.log(event)
    this.unitsSelect= event;
    if (event == undefined || event['Name']==''){
      this.ppUnit="Selecciona o crea una unidad"
    }else{
      this.ppUnit=null;
    }
  }

  addTagFnUnits(name) {
    const newTag = { ID: 0, Name: name };
    return newTag;
  }



  sendRegisterProduct(){
    this.checkClave();
    this.submittedProduct = true; // Marca el formulario como enviado
    this.registerFormProduct.controls['category_id'].patchValue({
        id          : this.categorySelect.ID,
        name        : this.categorySelect.Name,
        description : '',
        activate    : true,
        company_id  : Number(this.currentUser.user.company_id),
    });
    this.registerFormProduct.controls['unit_id'].patchValue({
      id          : this.unitsSelect.ID,
      name        : this.unitsSelect.Name,
      description : '',
      activate    : true,
      company_id  : Number(this.currentUser.user.company_id),
    });
    this.registerFormProduct.controls['category'].patchValue(this.categorySelect.Name)
    this.registerFormProduct.controls['unit'].patchValue(this.unitsSelect.Name)
    this.registerFormProduct.controls['iva_percentage'].patchValue(Number(this.ivaSeleccionado));
    if(this.idType==2){
      this.registerFormProduct.controls['costo'].patchValue(0)
    }


    if (this.registerFormProduct.invalid) {
      return; // Si el formulario es inválido, detiene la ejecución del método
    }

    this.spinner.show();
    this.productService.register(this.registerFormProduct.value)
    .subscribe(
      data => {
        if (data['created'] === true) {
          this.ivaSeleccionado = 16;
          this.spinner.hide();
          this.productService.productoActualizado(data);
          this.mostrarMensajeExito('Producto Creado Exitosamente')
          this.submittedProduct = false;
          this.closeModalEvent.emit();
          this.registerFormProduct.reset();
          this.registerFormProduct.get('id').setValue(0);
          this.registerFormProduct.get('activated').setValue(true);
          this.registerFormProduct.get('type_id').setValue(this.idType);
          this.registerFormProduct.get('iva_percentage').setValue(this.ivaSeleccionado);
          this.registerFormProduct.get('company_id').setValue(Number(this.currentUser.user.company_id));
          this.pp="Selecciona o crea una categoría"
          this.ppUnit="Selecciona o crea una unidad"
        }else{
          this.spinner.hide();
        }
      },
      error => {
        this.spinner.hide();
        this.mostrarMensajeError('Error al Crear Producto');
        this.pp="Selecciona o crea una categoría"
        this.ppUnit="Selecciona o crea una unidad"
        this.submittedProduct = false;
    });
  }


  sendUpdateProduct(idSupplier){
    this.checkClave()
    this.submittedProduct = true; // Marca el formulario como enviado

    this.registerFormProduct.controls['category_id'].patchValue({
      id          : this.categorySelect.ID,
      name        : this.categorySelect.Name,
      description : '',
      activate    : true,
      company_id  : Number(this.currentUser.user.company_id),
    });
    this.registerFormProduct.controls['unit_id'].patchValue({
      id          : this.unitsSelect.ID,
      name        : this.unitsSelect.Name,
      description : '',
      activate    : true,
      company_id  : Number(this.currentUser.user.company_id),
    });
    this.registerFormProduct.controls['category'].patchValue(this.categorySelect.Name)
    this.registerFormProduct.controls['unit'].patchValue(this.unitsSelect.Name)
    this.registerFormProduct.controls['iva_percentage'].patchValue(Number(this.ivaSeleccionado));
    if(this.idType==2){
      this.registerFormProduct.controls['costo'].patchValue(0)
    }

    if (this.registerFormProduct.invalid) {
      return; // Si el formulario es inválido, detiene la ejecución del método
    }

    this.spinner.show();
    this.productService.update(idSupplier, this.registerFormProduct.value)
    .subscribe(
      data => {
        if (data['updated'] === true) {
          this.ivaSeleccionado = 16;
          this.spinner.hide();
          this.productService.productoActualizado(data);
          this.mostrarMensajeExito('Producto Actualizado Exitosamente')
          this.submittedProduct = false;
          this.closeModalEvent.emit();
        }else{
          this.spinner.hide();
        }
      },
      error => {
        this.spinner.hide();
        this.mostrarMensajeError('Error al Crear Producto');
        this.submittedProduct = false;
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
