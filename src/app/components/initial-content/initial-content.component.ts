import { Component, OnInit } from '@angular/core';
import { ClientService } from "../../_services/client.service";
import { ProductsService } from "../../_services/products.service";
import { SuppliersService } from "../../_services/suppliers.service";
import { AuthenticationService } from '../../_services/authentication.service';

@Component({
  selector: 'app-initial-content',
  templateUrl: './initial-content.component.html',
  styles: []
})
export class InitialContentComponent implements OnInit {
  currentUser: any;
  companyID: number;
  totalProductosVenta: number = 0;
  totalProductosCompra: number = 0;
  totalSuppliers: number = 0;
  totalClients: number = 0;

  constructor(
    private clientService: ClientService,
    private supplierService: SuppliersService,
    private productService: ProductsService,
    private authenticationService: AuthenticationService,) {
      this.currentUser = this.authenticationService.currentUserValue;
      this.companyID = Number(this.currentUser.user.company_id);
    }

  ngOnInit() {
    this.getClients();
    this.getCountProducts();
    this.getCountSuppliers();
  }

  getCountProducts(){
    this.productService.getCount(this.companyID)
    .subscribe(
      data => {
        console.log(data)
        if ('1' in data){
          this.totalProductosVenta = Number(data['1'])
        }
        if ('2' in data){
          this.totalProductosCompra = Number(data['2'])
        }
      },
      error => {});
  }

  getCountSuppliers(){
    this.supplierService.getCount(this.companyID)
    .subscribe(
      data => {
        console.log(data)
        this.totalSuppliers = Number(data)
      },
      error => {});
  }

  getClients(){
    this.clientService.getCount(this.companyID)
    .subscribe(
      data => {
        console.log(data)
        this.totalClients = Number(data)
      },
      error => {});
  }

}
