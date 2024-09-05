import { Component, OnInit, OnDestroy, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { User } from '../../_models/user';
import { Subscription } from 'rxjs';
import { SuppliersService } from '../../_services/suppliers.service';
import { ClientService } from "../../_services/client.service";
import { AuthenticationService } from "../../_services/authentication.service";
import { Router } from '@angular/router';
import { ProductsService } from "../../_services/products.service";

import { AlertService, } from "../../_services/alert.service";
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { VentasService } from "../../_services/ventas.service";
import { FacturasService } from 'src/app/_services/facturas.service';
import { OrdenesCompraService } from 'src/app/_services/ordenes-compra.service';


interface TransactionDetail {
  ID: number;
  TransactionID: number;
  ProductID: number;
  ProductClave: string;
  ProductName: string;
  Amount: number;
  Precio: number;
  Iva: number;
  Total: number;
}

interface Transaction {
  ID: number;
  TransactionOwner: string;
  TransactionOwnerID: number;
  Folio: string;
  Date: string;
  Total: number;
  Company_id: number;
  Details: TransactionDetail[];
  IsLinked: boolean;
  DateLinked: string;
  Type: string;
}


@Component({
  selector: 'app-bancos',
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.scss']
})
export class BancosComponent implements OnInit {

  values = ['AM', 'PM'];
  defaultValue = this.values[1];
  currentTransaction: any;

  clientSearch = 0;
  selectedCliente: any = 0;
  selectedFacturas: any[] = [];
  selectedVentas: any[] = [];
  productSearch: any = 0;
  currentUser: any;

  clients: any[] = [];
  suppliers: any[] = [];


  companyID;
  searchText: string;
  propertyName: string;
  currentUserSubscription: Subscription;

  bills: any[] = [];
  facturas = [];
  purchaseOrders = [];
  abonos = 0;
  retiros = 0;
  sales: any[] = [];
  typeLabelToLink = 'Factura';
  homologedTransactions: Transaction[] = []

  grouped = new Map<string, Transaction[]>();


  sortOrder = 'asc';  // Puede ser 'asc' o 'desc'
  sortField: string = '';  // Campo actual por el cual ordenar

  currentDate = new Date();
  @ViewChild('vincluarTransaction', { static: false }) nuevaFacturaModal: any;

  constructor(
    private renderer: Renderer2,
    private authenticationService: AuthenticationService,
    private clientService: ClientService,
    private supplierService: SuppliersService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private facturaService: FacturasService,
    private purcahseService: OrdenesCompraService,
    ) {
      this.currentUser = this.authenticationService.currentUserValue;
      this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
        this.currentUser = user;
        this.companyID = Number(this.currentUser.user.company_id);
        this.loadDataBills();
        this.loadDataPurchaseOrders();
        console.log("SUPPLIER = ", this.selectedFacturas, this.selectedVentas)
    });
    this.facturaService.facturaActualizada$.subscribe(supplier => {
      if (supplier) {
        this.loadDataBills();
      }
    });
    this.purcahseService.ordenActualizada$.subscribe(supplier => {
      if (supplier) {
        this.loadDataPurchaseOrders();
      }
    });
    }

  ngOnInit() {}

  setLabel(label){
    if (label=='Factura') {
      this.currentTransaction = this.facturas
    }else{
      this.currentTransaction = this.purchaseOrders
    }
    this.typeLabelToLink = label;
    
  }

  get mergeBillsPurchaseOrder(){
    return [...this.facturas, ...this.purchaseOrders];
  }

  groupByDateLinked(){
    this.homologedTransactions.forEach(transaction => {
      const key = transaction.DateLinked || "Unlinked";  // Manejar DateLinked vacío como "Unlinked"
      const group = this.grouped.get(key) || [];
      group.push(transaction);
      this.grouped.set(key, group);
    });

    let sortedGroups = Array.from(this.grouped.entries());

    // Ordenar primero por 'Unlinked', luego por fecha
    sortedGroups.sort((a, b) => {
        if (a[0] === 'Unlinked') return -1;
        if (b[0] === 'Unlinked') return 1;
        return a[0] < b[0] ? -1 : 1;
    });

    // Convertir de nuevo a Map para mantener la estructura original si es necesario
    this.grouped = new Map(sortedGroups);


  }

  sumAllTotals(transactions: Transaction[]): number {
    return transactions.reduce((accumulator, currentTransaction) => accumulator + currentTransaction.Total, 0);
  }
  

  onClienteSelected(event: any){
    const selectedValue = event.target.value;
    if (selectedValue == 0 ){
      this.selectedFacturas = this.bills
    }else{
      this.selectedFacturas = this.bills.filter(v => v.id == selectedValue);
    }
  }

  onProductsSelected(event: any){
    const selectedValue = event.target.value;
    if (selectedValue == 0 ){
      this.selectedFacturas = this.bills
    }else{
      this.selectedFacturas = this.bills.map(v => ({
        ...v, // Mantenemos todas las propiedades de la venta original
        sales: v.bill.filter(s => 
          s.Details.some(d => d.ProductID == selectedValue) // Solo mantenemos las 'Sales' que tienen al menos un 'Detail' con el 'ProductID' correcto
        )
      })).filter(v => v.sales.length > 0); // Eliminamos las ventas que no tienen ninguna 'sale' después del filtrado
    }
  }

  setTransiction(tran){
    this.currentTransaction = this.grouped.get(tran);
  }

  totalCurrentVenta(){
    let total = 0;
    this.currentTransaction['Details'].forEach(element => {
      total = total + element['Total']
    });
    return total
  }


  loadDataClients() {
    this.spinner.show();
    this.clientService.getAll(this.companyID)
      .subscribe(
        data => {
          if (data) {
            this.clients = data.filter(s => s.activated && s.activated === true);
            this.sales =  this.clients.filter(b => b.sales && b.sales.length > 0);
            this.sales.forEach(c => {
              c.sales.forEach(s =>{
                this.homologedTransactions.push({
                  ID: s.ID,
                  TransactionOwner: c.name,
                  TransactionOwnerID: s.ClientID,
                  Folio: null,
                  Date: s.Date,
                  Total: s.Total,
                  Company_id: s.Company_id,
                  Details: s.Details.map(d => ({
                    ID: d.ID,
                    TransactionID: d.SaleID,
                    ProductID: d.ProductID,
                    ProductClave: d.ProductClave,
                    ProductName: d.ProductName,
                    Amount: d.Amount,
                    Precio: d.Precio,
                    Iva: d.Iva,
                    Total: d.Total
                  })),
                  IsLinked: s.IsLinked,
                  DateLinked: s.DateLinked,
                  Type: 'income',
                })
              })
            });
            this.spinner.hide();
          }
          this.loadDataSuppliers();
        },
        error => {
          this.spinner.hide();
          this.mostrarMensajeError('Error al Obtener los Proveedores');
      });
  }


  loadDataSuppliers() {
    this.spinner.show();
    this.supplierService.getAll(this.companyID)
      .subscribe(
        data => {
          if (data) {
            this.suppliers = data.filter(s => s.Activated && s.Activated === true);
            this.bills =  this.suppliers.filter(b => b.Bills && b.Bills.length > 0);
            this.bills.forEach(p => {
              p.Bills.forEach(b =>{
                this.homologedTransactions.push({
                  ID: p.ID,
                  TransactionOwner: p.Name,
                  TransactionOwnerID: b.Supplier_id,
                  Folio: b.Folio,
                  Date: b.Date,
                  Total: b.Total,
                  Company_id: b.Company_id,
                  Details: b.Details.map(d => ({
                    ID: d.ID,
                    TransactionID: d.BillID,
                    ProductID: d.ProductID,
                    ProductClave: d.ProductClave,
                    ProductName: d.ProductName,
                    Amount: d.Amount,
                    Precio: d.Precio,
                    Iva: d.Iva,
                    Total: d.Total
                  })),
                  IsLinked: b.IsLinked,
                  DateLinked: b.DateLinked,
                  Type: 'outcome',
                })
              })
            });
            this.spinner.hide();
          }
          console.log("Homologated Transactions = ", this.homologedTransactions)
          this.groupByDateLinked()
          console.log("Grouped 2 = ", this.grouped)
        },
        error => {
          this.spinner.hide();
          this.mostrarMensajeError('Error al Obtener los Proveedores');
      });
  }

  loadDataBills() {
    this.spinner.show();
    this.facturaService.getAll(this.companyID)
      .subscribe(
        (data:any) => {
          if (data) {
            this.facturas = data
            this.spinner.hide();
            this.abonos = this.facturas.reduce((total,p) => total + p.Total, 0)
            console.log("FACTURAS = ", this.facturas)
          }
        },
        error => {
          this.spinner.hide();
          this.mostrarMensajeError('Error al Obtener las Facturas');
      });
  }

  loadDataPurchaseOrders() {
    this.spinner.show();
    this.purcahseService.getAll(this.companyID)
      .subscribe(
        (data:any) => {
          if (data) {
            this.purchaseOrders = data
            this.spinner.hide();
            this.retiros = this.purchaseOrders.reduce((total,p) => total + p.Total, 0)
            console.log("ORDENES DE COMPRA = ", this.purchaseOrders)
          }
        },
        error => {
          this.spinner.hide();
          this.mostrarMensajeError('Error al Obtener las Ordenes de Compra');
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
