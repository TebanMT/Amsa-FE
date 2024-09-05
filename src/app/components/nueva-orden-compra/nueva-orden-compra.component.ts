import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnChanges} from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';
import { OrdenesCompraService } from "../../_services/ordenes-compra.service";
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';


@Component({
  selector: 'app-nueva-orden-compra',
  templateUrl: './nueva-orden-compra.component.html',
  styleUrls: ['./nueva-orden-compra.component.scss']
})
export class NuevaOrdenCompraComponent implements OnInit {

  @Output() closeModalEvent = new EventEmitter<void>();
  @Input() proveedores: any = null;
  @Input() productsCompra: any = null;
  @Input() user: any = null;

  today: Date = new Date();

  registerOrdenCompra: FormGroup;
  submittedOrdenCompra = false;
  ivaSelected = 0;
  isDuplicate: boolean = false;

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private ordenService: OrdenesCompraService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    console.log("ProveedSores    ", this.proveedores, this.productsCompra)
    this.registerOrdenCompra = this.formBuilder.group({
      id: [0],
      date: [this.today, Validators.required],
      folio: ['', Validators.required],
      supplier: ['', Validators.required],
      status: [''],
      products: this.formBuilder.array([]),
      totalOperation: [0, Validators.required],
      company_id: [Number(this.user.user.company_id)],
    });
    this.addProducto();
  }



  get productos() {
    return this.registerOrdenCompra.get('products') as FormArray;
  }

  addProducto() {
    const productoFormGroup = this.formBuilder.group({
      idProduct: ['', Validators.required],
      product: ['', Validators.required],
      productName: ['', Validators.required],
      productClave: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      unitPrice: [null, Validators.required],
      ivaPrice: [null, Validators.required],
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
      productoFormGroup.controls['ivaPrice'].patchValue((productoFormGroup.controls['amount'].value * productoFormGroup.controls['unitPrice'].value) * (this.ivaSelected/100))
      productoFormGroup.controls['total'].patchValue(productoFormGroup.controls['amount'].value * productoFormGroup.controls['unitPrice'].value + productoFormGroup.controls['ivaPrice'].value)
      this.calculateSubtotal();
    });
  }

  removeProducto(index: number) {
    this.productos.removeAt(index);
  }

  get u() { return this.registerOrdenCompra.controls; }

  calculateSubtotal() {
    let totalOperation = 0;
    this.productos.controls.forEach((producto) => {
      const total = producto.get('total').value;
      totalOperation = totalOperation + total
      });
      this.registerOrdenCompra.controls['totalOperation'].patchValue(totalOperation);
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
    (this.registerOrdenCompra.get('products') as FormArray).push(productControl);
  }

  onAmountChange(event: any): void {
    // Accede a la propiedad 'value' del evento para obtener el valor del select
    const amountSelected = event.target.value;
    console.log('Producto seleccionado:', amountSelected);
    this.registerOrdenCompra.controls['subTotal'].patchValue(amountSelected * this.registerOrdenCompra.controls['unitPrice'].value)
    this.registerOrdenCompra.controls['total'].patchValue(amountSelected * this.registerOrdenCompra.controls['unitPrice'].value + this.registerOrdenCompra.controls['iva'].value)
}

  precioTotal(precio, ivaPercentage) {return ((Number(precio) * Number(ivaPercentage))/100.00) + Number(precio) }

  get productsI() {
    return this.registerOrdenCompra.get('products') as FormArray;
  }

  onSubmit(){
    this.checkFolio();
    this.spinner.show();
    this.submittedOrdenCompra = true; // Marca el formulario como enviado

    if (this.registerOrdenCompra.invalid) {
      this.spinner.hide();
      return; // Si el formulario es inválido, detiene la ejecución del método
    }
    //this.deleteProductsForm()
    this.ordenService.register(this.registerOrdenCompra.value)
    .subscribe(
      data => {
        if (data['created'] === true) {
          this.spinner.hide();
            this.ordenService.ordenCompraActualizada(data);
            this.mostrarMensajeExito('Orden de Compra Creada Exitosamente')
            this.submittedOrdenCompra = false;
            this.closeModalEvent.emit();
            this.registerOrdenCompra = this.formBuilder.group({
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
          this.mostrarMensajeError('Error al Crear Orden de Compra');
          this.submittedOrdenCompra = false;
    });
  }

  checkFolio(){
    console.log("check")
    const folio = this.registerOrdenCompra.controls['folio'].value
    this.ordenService.existFolio(Number(this.user.user.company_id), folio)
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
