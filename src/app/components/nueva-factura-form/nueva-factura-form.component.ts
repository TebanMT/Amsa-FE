import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnChanges} from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';
import { FacturasService } from "../../_services/facturas.service";
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-nueva-factura-form',
  templateUrl: './nueva-factura-form.component.html',
  styleUrls: ['./nueva-factura-form.component.scss']
})
export class NuevaFacturaFormComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Input() clients: any = null;
  @Input() products: any = null;
  @Input() user: any = null;

  today: Date = new Date();

  registerFactura: FormGroup;
  submittedFactura = false;
  ivaSelected = 0;
  isDuplicate: boolean = false;

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private facturasService: FacturasService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    console.log("Proveedores    ", this.clients, this.products)
    this.registerFactura = this.formBuilder.group({
      id: [0],
      date: [this.today, Validators.required],
      folio: ['', Validators.required],
      client: ['', Validators.required],
      products: this.formBuilder.array([]),
      totalOperation: [0, Validators.required],
      company_id: [Number(this.user.user.company_id)],
    });
    this.addProducto();
  }

  get productos() {
    return this.registerFactura.get('products') as FormArray;
  }

  addProducto() {
    const productoFormGroup = this.formBuilder.group({
      idProduct: ['', Validators.required],
      product: ['', Validators.required],
      productName: ['', Validators.required],
      productClave: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      unitPrice: [null, Validators.required],
      iva: [null, Validators.required],
      subTotal: [{value: 0, disabled: true}],
      total: ['', Validators.required],
    });

    this.productos.push(productoFormGroup);

    // Calcula el subtotal cada vez que cambia la cantidad o el precio unitario
    productoFormGroup.get('product').valueChanges.subscribe((p) => {
      console.log(p)
      productoFormGroup.controls['unitPrice'].patchValue((p['Precio']))
      this.ivaSelected = p['Iva_percentage']
      productoFormGroup.controls['amount'].patchValue(1)
      productoFormGroup.controls['idProduct'].patchValue(p['ID'])
      productoFormGroup.controls['productName'].patchValue(p['Name'])
      productoFormGroup.controls['productClave'].patchValue(p['Clave'])
    } );
    productoFormGroup.get('amount').valueChanges.subscribe(() =>
    {
      console.log(this.ivaSelected)
      productoFormGroup.controls['subTotal'].patchValue(productoFormGroup.controls['amount'].value * productoFormGroup.controls['unitPrice'].value)
      productoFormGroup.controls['iva'].patchValue((productoFormGroup.controls['amount'].value * productoFormGroup.controls['unitPrice'].value) * (this.ivaSelected/100))
      productoFormGroup.controls['total'].patchValue(productoFormGroup.controls['amount'].value * productoFormGroup.controls['unitPrice'].value + productoFormGroup.controls['iva'].value)
      this.calculateSubtotal();
    });
  }

  removeProducto(index: number) {
    this.productos.removeAt(index);
  }

  get u() { return this.registerFactura.controls; }

  calculateSubtotal() {
    let totalOperation = 0;
    this.productos.controls.forEach((producto) => {
      const total = producto.get('total').value;
      totalOperation = totalOperation + total
      });
      this.registerFactura.controls['totalOperation'].patchValue(totalOperation);
  }
  deleteProductsForm() {
    this.productos.controls.forEach((producto) => {
      if (producto instanceof FormGroup) {
        // Ahora puedes llamar removeControl de manera segura
        producto.removeControl('product');
      }
    });
  }

  addProduct() {
    // Crear un nuevo grupo de formulario para el nuevo producto
    const productControl = this.formBuilder.group({
      product: ['', Validators.required] // Asegúrate de que 'product' es el nombre correcto del control
    });
  
    // Acceder al FormArray 'products' y añadir el nuevo grupo de control
    (this.registerFactura.get('products') as FormArray).push(productControl);
  }

  onAmountChange(event: any): void {
    // Accede a la propiedad 'value' del evento para obtener el valor del select
    const amountSelected = event.target.value;
    console.log('Producto seleccionado:', amountSelected);
    this.registerFactura.controls['subTotal'].patchValue(amountSelected * this.registerFactura.controls['unitPrice'].value)
    this.registerFactura.controls['total'].patchValue(amountSelected * this.registerFactura.controls['unitPrice'].value + this.registerFactura.controls['iva'].value)
}

  precioTotal(precio, ivaPercentage) {return ((Number(precio) * Number(ivaPercentage))/100.00) + Number(precio) }

  get productsI() {
    return this.registerFactura.get('products') as FormArray;
  }

  onSubmit(){
    this.checkFolio();
    this.spinner.show();
    this.submittedFactura = true; // Marca el formulario como enviado

    if (this.registerFactura.invalid) {
      this.spinner.hide();
      return; // Si el formulario es inválido, detiene la ejecución del método
    }
    //this.deleteProductsForm()
    this.facturasService.register(this.registerFactura.value)
    .subscribe(
      data => {
        if (data['created'] === true) {
          this.spinner.hide();
            this.facturasService.ventaActualizada(data);
            this.mostrarMensajeExito('Factura Creada Exitosamente')
            this.submittedFactura = false;
            this.closeModalEvent.emit();
            this.registerFactura = this.formBuilder.group({
              id: [0],
              date: [this.today, Validators.required],
              supplier: ['', Validators.required],
              products: this.formBuilder.array([]),
              totalOperation: [0, Validators.required],
              company_id: [Number(this.user.user.company_id)],
            });
            this.addProducto();
        }else{
          //this.addProduct();
          this.spinner.hide();
        }
      },
      error => {
        
        //this.addProduct();
        this.spinner.hide();
          this.mostrarMensajeError('Error al Crear Factura');
          this.submittedFactura = false;
    });
  }

  checkFolio(){
    console.log("check")
    const folio = this.registerFactura.controls['folio'].value
    this.facturasService.existFolio(Number(this.user.user.company_id), folio)
    .subscribe(data => {
      if (data === true) {
        this.isDuplicate = true
      }else{
        this.isDuplicate = false
      }
    },
    error =>{
      this.mostrarMensajeError('Error al Verificar Folio');
    })
  }

  mostrarMensajeExito(mensaje: string) {
    this.toastr.success(mensaje, 'Exito');
  }

  mostrarMensajeError(mensaje: string) {
    this.toastr.error(mensaje, 'Error');
  }

}
