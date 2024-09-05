import { Component, OnInit, ViewContainerRef, Renderer2, ComponentFactoryResolver, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthenticationService } from '../../../_services/authentication.service';

import { InitialContentComponent } from "../../initial-content/initial-content.component";
import { RegisterUserContentComponent } from "../../register-user-content/register-user-content.component";
import { SuppliersComponent } from "../../suppliers/suppliers.component";

import { User } from '../../../_models/user';
import { ProductsComponent } from '../../products/products.component';
import { VentasComponent } from '../../ventas/ventas.component';
import { FacturasComponent } from '../../facturas/facturas.component';
import { OrdenesCompraComponent } from '../../ordenes-compra/ordenes-compra.component';
import { BancosComponent } from '../../bancos/bancos.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styles: []
})
export class MenuComponent implements OnInit, OnDestroy {
  @ViewChild('figureContainer', {static: true,read: ViewContainerRef}) figureContainer;
  activeTab = 0;
  menu = [
        {
          title: 'ADMIN',
          content:[
          {
            title: 'Home',
            component: InitialContentComponent,
            icon: "fa fa-home"
          },


          {
            title: 'separator',
            component: null,
            icon: ""
          },


          {
            title: 'Clientes',
            component: RegisterUserContentComponent,
            icon: "fa fa-users"
          },
          {
            title: 'Productos de Venta',
            component: ProductsComponent,
            icon: "fa fa-shopping-basket"
          },
          {
            title: 'Ventas de Mostrador',
            component: VentasComponent,
            icon: "fa fa-money-bill"
          },
          {
            title: 'Facturas Clientes',
            component: FacturasComponent,
            icon: "fa fa-file-invoice-dollar"
          },



          {
            title: 'separator',
            component: null,
            icon: ""
          },



          {
            title: 'Proveedores',
            component: SuppliersComponent,
            icon: "fa fa-truck"
          },
          {
            title: 'Productos de Compra',
            component: ProductsComponent,
            icon: "fa fa-shopping-basket"
          },
          {
            title: 'Ordenes de Compra',
            component: OrdenesCompraComponent,
            icon: "fa fa-file-invoice-dollar"
          },
        


          {
            title: 'separator',
            component: null,
            icon: ""
          },



          {
            title: 'Bancos',
            component: BancosComponent,
            icon: "fa fa-university"
          },      
        ]
        },
  ] 
  users: User[] = [];
  currentUser: any;
  currentUserSubscription: Subscription;

  constructor(private authenticationService: AuthenticationService,
    private router: Router,private componentFactoryResolver: ComponentFactoryResolver,
    private renderer: Renderer2,) { }

  ngOnInit() {
    this.renderer.addClass(document.body, 'sidebar-collapse');
    const factory = this.componentFactoryResolver.resolveComponentFactory(InitialContentComponent);
    this.figureContainer.createComponent(factory)
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      if (user) {
        this.currentUser = user["user"]; 
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

  changeTab(pos) {
    if (pos.component === null){
      return
    }
    console.log(pos)
    this.activeTab = pos;
    this.figureContainer.clear();
    const factory = this.componentFactoryResolver.resolveComponentFactory(pos.component);
    const componentRef = this.figureContainer.createComponent(factory)
    if(pos.title == 'Productos de Venta'){
      componentRef.instance.origin = 'Venta';
    }
    if(pos.title == 'Productos de Compra'){
      componentRef.instance.origin = 'Compra';
    }
    componentRef.changeDetectorRef.detectChanges();
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
}

}
