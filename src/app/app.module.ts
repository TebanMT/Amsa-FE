import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule }    from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// used to create fake backend
//import { fakeBackendProvider } from './_helpers/fake-backend';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { MenuComponent } from './components/shared/menu/menu.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { AlertComponent } from './components/alert/alert/alert.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

import { ErrorInterceptor } from './_helpers/error.interceptor';
import { JwtInterceptor, } from "./_helpers/jwt.interceptor";
import { InitialContentComponent } from './components/initial-content/initial-content.component';
import { RegisterUserContentComponent } from './components/register-user-content/register-user-content.component';
import { NuevoClienteFormComponent } from './components/nuevo-cliente-form/nuevo-cliente-form.component';
import { NgxPaginationModule } from "ngx-pagination";


import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { FormsModule } from '@angular/forms';
import { FilterSuppliersPipe } from './pipes/filter-suppliers.pipe';
import { MatButtonModule, MatCheckboxModule,MatPaginatorModule, MatSortModule, MatTableModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NuevoProveedorFormComponent } from './components/nuevo-proveedor-form/nuevo-proveedor-form.component';
import { ProductsComponent } from './components/products/products.component';
import { NuevoProductoFormComponent } from './components/nuevo-producto-form/nuevo-producto-form.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from "ngx-spinner";
import { VentasComponent } from './components/ventas/ventas.component';
import { NuevaVentaFormComponent } from './components/nueva-venta-form/nueva-venta-form.component';
import { FacturasComponent } from './components/facturas/facturas.component';
import { NuevaFacturaFormComponent } from './components/nueva-factura-form/nueva-factura-form.component';
import { BancosComponent } from './components/bancos/bancos.component';
import { VincularFacturaComponent } from './components/vincular-factura/vincular-factura.component';
import { OrdenesCompraComponent } from './components/ordenes-compra/ordenes-compra.component';
import { NuevaOrdenCompraComponent } from './components/nueva-orden-compra/nueva-orden-compra.component'


const ENTRYCOMPONENTS = [
  InitialContentComponent,
  RegisterUserContentComponent,
  SuppliersComponent,
  ProductsComponent,
  VentasComponent,
  FacturasComponent,
  BancosComponent,
  OrdenesCompraComponent
];

const COMPONENTS = [AppComponent,
                    HeaderComponent,
                    MenuComponent,
                    FooterComponent,
                    AlertComponent,
                    HomeComponent,
                    LoginComponent,
                    RegisterComponent,
                    
                  ];


@NgModule({
  declarations: [
    COMPONENTS,
    ENTRYCOMPONENTS,
    NuevoClienteFormComponent,
    FilterSuppliersPipe,
    NuevoProveedorFormComponent,
    NuevoProductoFormComponent,
    VentasComponent,
    NuevaVentaFormComponent,
    FacturasComponent,
    NuevaFacturaFormComponent,
    BancosComponent,
    VincularFacturaComponent,
    OrdenesCompraComponent,
    NuevaOrdenCompraComponent,
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    MatButtonModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    NgxSpinnerModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    // provider used to create fake backend
    //fakeBackendProvider
  ],
  bootstrap: [AppComponent],
  entryComponents: [ENTRYCOMPONENTS]
})
export class AppModule { }
