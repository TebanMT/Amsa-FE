import { Component, OnInit, OnDestroy, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { User } from '../../_models/user';
import { Subscription } from 'rxjs';
import { UserService } from '../../_services/user.service';
import { ClientService } from "../../_services/client.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { Router } from '@angular/router';
import { ProductsService } from "../../_services/products.service";

import { AlertService, } from "../../_services/alert.service";
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { VentasService } from "../../_services/ventas.service";
import { FacturasService } from 'src/app/_services/facturas.service';


@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.scss']
})
export class FacturasComponent implements OnInit {

  facturas: any;
  values = ['AM', 'PM'];
  defaultValue = this.values[1];
  currentFactura: any;

  clientSearch = 0;
  selectedCliente: any = 0;
  selectedFacturas: any[] = [];
  productSearch: any = 0;
  currentUser: any;
  clients: any[] = [];
  products: any[] = [];
  companyID;
  searchText: string;
  propertyName: string;
  currentUserSubscription: Subscription;

  sales: any[];  // Supongamos que sales es tu arreglo de ventas
  sortOrder = 'asc';  // Puede ser 'asc' o 'desc'
  sortField: string = '';  // Campo actual por el cual ordenar
  @ViewChild('nuevaFacturaModal', { static: false }) nuevaFacturaModal: any;


  constructor(
    private renderer: Renderer2,
    private authenticationService: AuthenticationService,
    private clientsService: ClientService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private productService: ProductsService,
    private facturaService: FacturasService,
    ) {
      this.currentUser = this.authenticationService.currentUserValue;
      this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
        this.currentUser = user;
        this.companyID = Number(this.currentUser.user.company_id);
        this.loadDataProducts();
        this.loadDataClients();
    });
    this.facturaService.facturaActualizada$.subscribe(supplier => {
      if (supplier) {
        this.loadDataClients();
      }
    });
    }

  ngOnInit() {
    //this.loadData();
    //this.clientSearch = "Test"
  }

  onClienteSelected(event: any){
    const selectedValue = event.target.value;
    if (selectedValue == 0 ){
      this.selectedFacturas = this.facturas
    }else{
      this.selectedFacturas = this.facturas.filter(v => v.id == selectedValue);
    }
  }

  onProductsSelected(event: any){
    const selectedValue = event.target.value;
    if (selectedValue == 0 ){
      this.selectedFacturas = this.facturas
    }else{
      this.selectedFacturas = this.facturas.map(v => ({
        ...v, // Mantenemos todas las propiedades de la venta original
        sales: v.sales.filter(s => 
          s.Details.some(d => d.ProductID == selectedValue) // Solo mantenemos las 'Sales' que tienen al menos un 'Detail' con el 'ProductID' correcto
        )
      })).filter(v => v.sales.length > 0); // Eliminamos las ventas que no tienen ninguna 'sale' después del filtrado
    }
  }

  setFactura(factura){
    this.currentFactura = factura;
  }

  totalCurrentVenta(){
    let total = 0;
    this.currentFactura['Details'].forEach(element => {
      total = total + element['Total']
    });
    return total
  }

  loadDataClients() {
    this.spinner.show();
    this.clientsService.getAllWithBills(this.companyID)
      .subscribe(
        data => {
          if (data) {
            this.clients = data.filter(client => client.activated && client.activated === true);
            this.facturas =  this.clients.filter(client => client.Bills && client.Bills.length > 0);
            this.selectedFacturas = this.facturas;
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
    this.productService.getAll(this.companyID, 1)
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
    this.renderer.setStyle(this.nuevaFacturaModal.nativeElement, 'display', 'none');
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
    console.log(this.selectedFacturas, field, id)
    this.selectedFacturas[id]['sales'].sort((a, b) => {
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
