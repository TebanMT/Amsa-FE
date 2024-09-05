import { Component, OnInit, Renderer2, ViewChild, ElementRef, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProductsService } from "../../_services/products.service";
import { CategoriesService } from "../../_services/categories.service";
import { UnitsService } from "../../_services/units.service";
import { AuthenticationService } from '../../_services/authentication.service';
import { first } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  @Input() origin: string;

  products: any[] = [];
  activeProducts: any[] = [];
  dectiveProducts: any[] = [];
  numberPages: number = 0;
  searchText: string = "";
  product: any = {}
  currentUser: any;
  companyID: any;
  selectedOption: any;
  propertyName: any = "Name";
  categories: any = []
  units: any = [];
  idType: number;
  

  @ViewChild('nuevoProductoModal', { static: false }) nuevoProductoModal: any;
  @ViewChild('editarModal', { static: false }) editarModal: any;

  @ViewChild('eliminarProductoModal',  { static: false }) eliminarProductoModal: ElementRef;

  constructor(
    private renderer: Renderer2,
    private toastr: ToastrService,
    private productService: ProductsService,
    private authenticationService: AuthenticationService,
    private categoryService: CategoriesService,
    private unitService: UnitsService,
    private spinner: NgxSpinnerService) {
      this.currentUser = this.authenticationService.currentUserValue;
      this.companyID = Number(this.currentUser.user.company_id);
      this.loadCategories();
      this.loadUnits();
      this.productService.productoActualizado$.subscribe(product => {
        if (product) {
          this.loadData();
          this.loadCategories();
          this.loadUnits();
        }
      });
    }

  ngOnInit() {
    if(this.origin == 'Venta'){
      this.idType = 1;
    }
    if(this.origin == 'Compra'){
      this.idType = 2;
    }
    this.loadData();
  }

  selectTableView(changes): void {
    if(changes === 'inactivos'){
      this.products = this.dectiveProducts;
      this.numberPages = Math.ceil(this.dectiveProducts.length / 10);
    }else{
      this.products = this.activeProducts;
      this.numberPages = Math.ceil(this.activeProducts.length / 10);
    }
  }

  loadCategories() {
    this.spinner.show();
    this.categoryService.getAll(Number(this.currentUser.user.company_id))
      .subscribe(
        data => {
          this.categories = data;
          this.spinner.hide();
        },
        error => {
          this.spinner.hide();
          console.log(error);
        }
      );
  }

  loadUnits() {
    this.spinner.show();
    this.unitService.getAll(Number(this.currentUser.user.company_id))
      .subscribe(
        data => {
          this.units = data;
          this.spinner.hide();
        },
        error => {
          console.log(error);
          this.spinner.hide();
        }
      );
  }

  loadData() {
    this.spinner.show();
    this.productService.getAll(this.companyID, this.idType)
      .subscribe(
        data => {
          if (data) {
            this.activeProducts = data.filter(product => product.Activated && product.Activated === true);
            this.dectiveProducts = data.filter(p => p.Activated === false);
            this.numberPages = Math.ceil(this.activeProducts.length / 10);
            this.products = this.activeProducts;
            this.spinner.hide();
          }
        },
        error => {
          this.spinner.hide();
          this.mostrarMensajeError('Error al Obtener los Proveedores');
      });
  }

  get pages(): number[] {
    return Array.from({length: this.numberPages}, (v, k) => k + 1);
  }

  precioTotal(precio, ivaPercentage) {return ((Number(precio) * Number(ivaPercentage))/100.00) + Number(precio) }

  setProduct(product: any){
    this.product = product
  }

  closeModal() {
    this.renderer.setStyle(this.nuevoProductoModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();

  }

  closeModalEditar() {
    this.renderer.setStyle(this.editarModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();

  }

  abrirModalEliminar(product) {
    console.log("product === ",product)
    this.product = product
    this.eliminarProductoModal.nativeElement.style.display = 'block';
  }

  cerrarModalEliminar() {
    this.renderer.setStyle(this.eliminarProductoModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();
  }

  confirmarEliminacion() {
    this.spinner.show();
    this.productService.deactivate(this.product.ID)
    .pipe(first())
    .subscribe(
      data => {
        this.spinner.hide();
        if (data['deactivate']) {
          this.loadData();
          this.mostrarMensajeExito('Producto Eliminado Exitosamente');
          this.cerrarModalEliminar();
        }else{
          this.loadData()
          this.mostrarMensajeError("Error al Eliminar el Producto");
          this.cerrarModalEliminar();
        }
      },
      error => {
        this.loadData()
        this.mostrarMensajeError("Error al Eliminar el Producto");
        this.cerrarModalEliminar();
      }); 
  }

  mostrarMensajeExito(mensaje: string) {
    this.toastr.success(mensaje, 'Exito');
  }

  removeModalBackdrop() {
    const backdrops = document.getElementsByClassName('modal-backdrop') as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < backdrops.length; i++) {
      backdrops[i].style.display = 'none';
    }
    document.body.classList.remove('modal-open'); // Restaura el desplazamiento (scroll) del body
  }

  mostrarMensajeError(mensaje: string) {
    this.toastr.error(mensaje, 'Error');
  }
  

}
