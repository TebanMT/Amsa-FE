import { Component, OnInit, OnDestroy, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { User } from '../../_models/user';
import { Subscription } from 'rxjs';
import { UserService } from '../../_services/user.service';
import { ClientService } from "../../_services/client.service";
import { SuppliersService } from "../../_services/suppliers.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { Router } from '@angular/router';
import { ProductsService } from "../../_services/products.service";

import { AlertService, } from "../../_services/alert.service";
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { VentasService } from "../../_services/ventas.service";
import { OrdenesCompraService } from '../../_services/ordenes-compra.service';


@Component({
  selector: 'app-ordenes-compra',
  templateUrl: './ordenes-compra.component.html',
  styleUrls: ['./ordenes-compra.component.scss']
})
export class OrdenesCompraComponent implements OnInit {

  ordenesCompra: any;
  values = ['AM', 'PM'];
  defaultValue = this.values[1];
  currentOrdenCompra: any;

  proveedorSearch = 0;
  selectedProveedor: any = 0;
  selectedOrdenesCompra: any[] = [];
  productSearch: any = 0;
  currentUser: any;
  proveedores: any[] = [];
  products: any[] = [];
  companyID;
  searchText: string;
  propertyName: string;
  currentUserSubscription: Subscription;

  sales: any[];  // Supongamos que sales es tu arreglo de ventas
  sortOrder = 'asc';  // Puede ser 'asc' o 'desc'
  sortField: string = '';  // Campo actual por el cual ordenar
  @ViewChild('nuevaOrdenCompraModal', { static: false }) nuevaOrdenCompraModal: any;


  constructor(
    private renderer: Renderer2,
    private authenticationService: AuthenticationService,
    private supplierService: SuppliersService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private productService: ProductsService,
    private ordenesService: OrdenesCompraService
    ) {
      this.currentUser = this.authenticationService.currentUserValue;
      this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
        this.currentUser = user;
        this.companyID = Number(this.currentUser.user.company_id);
        this.loadDataProducts();
        this.loadDataSuppliers();
    });
    this.ordenesService.ordenActualizada$.subscribe(supplier => {
      if (supplier) {
        this.loadDataSuppliers();
      }
    });
    }

  ngOnInit() {
    //this.loadData();
    //this.clientSearch = "Test"
  }

  onProveedorSelected(event: any){
    const selectedValue = event.target.value;
    if (selectedValue == 0 ){
      this.selectedOrdenesCompra = this.ordenesCompra
    }else{
      this.selectedOrdenesCompra = this.ordenesCompra.filter(v => v.ID == selectedValue);
    }
  }

  onProductsSelected(event: any){
    const selectedValue = event.target.value;
    if (selectedValue == 0 ){
      this.selectedOrdenesCompra = this.ordenesCompra
    }else{
      this.selectedOrdenesCompra = this.ordenesCompra.map(v => ({
        ...v, // Mantenemos todas las propiedades de la venta original
        sales: v.sales.filter(s => 
          s.Details.some(d => d.ProductID == selectedValue) // Solo mantenemos las 'Sales' que tienen al menos un 'Detail' con el 'ProductID' correcto
        )
      })).filter(v => v.sales.length > 0); // Eliminamos las ventas que no tienen ninguna 'sale' después del filtrado
    }
  }

  setOrdeCompra(orden){
    this.currentOrdenCompra = orden;
  }

  totalCurrentVenta(){
    let total = 0;
    this.currentOrdenCompra['Details'].forEach(element => {
      total = total + element['Total']
    });
    return total
  }

  loadDataSuppliers() {
    this.spinner.show();
    this.supplierService.getAll(this.companyID)
      .subscribe(
        data => {
          if (data) {
            this.proveedores = data.filter(proveedor => proveedor.Activated && proveedor.Activated === true);
            this.ordenesCompra =  this.proveedores.filter(proveedor => proveedor.Orders && proveedor.Orders.length > 0);
            this.selectedOrdenesCompra = this.ordenesCompra;
            console.log("Prooveedores = ", this.proveedores)
          }
          this.spinner.hide();
        },
        error => {
          this.spinner.hide();
          this.mostrarMensajeError('Error al Obtener los Clientes');
      });
  }

  loadDataProducts() {
    this.spinner.show();
    this.productService.getAll(this.companyID, 2)
      .subscribe(
        data => {
          if (data) {
            this.products = data.filter(product => product.Activated && product.Activated === true);
            this.spinner.hide();
          }
        },
        error => {
          this.spinner.hide();
          this.mostrarMensajeError('Error al Obtener los Proveedores');
      });
  }

  precioTotal(precio, ivaPercentage) {return ((Number(precio) * Number(ivaPercentage))/100.00) + Number(precio) }


  closeModal() {
    this.renderer.setStyle(this.nuevaOrdenCompraModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();
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


  sortBy(field: string, id: number): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    console.log(this.selectedOrdenesCompra, field, id)
    this.selectedOrdenesCompra[id]['sales'].sort((a, b) => {
      if (a[field] < b[field]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[field] > b[field]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

}



