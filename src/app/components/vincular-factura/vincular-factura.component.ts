import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FacturasService } from "../../_services/facturas.service";
import { OrdenesCompraService } from "../../_services/ordenes-compra.service";
import { AuthenticationService } from '../../_services/authentication.service';
import { LowerCasePipe } from '@angular/common';
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-vincular-factura',
  templateUrl: './vincular-factura.component.html',
  styleUrls: ['./vincular-factura.component.scss']
})
export class VincularFacturaComponent implements OnInit {

  @Output() closeModalEvent = new EventEmitter<void>();
  @Input() transaction: any = null;
  @Input() user: any = null;

  submittedSuppliers = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private authenticationService: AuthenticationService,
    private billsService: FacturasService,
    private ordersService: OrdenesCompraService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
  }
  
  vincular(t){
    this.spinner.show();
    this.submittedSuppliers = true; // Marca el formulario como enviado

    if(t.Client){
      this.vincularFactura(t.ID);

    }else{
      this.vincularPurchaseOrder(t.ID);

    }
  }

  vincularFactura(id){
    this.billsService.vincular(Number(this.user.user.company_id), id)
    .subscribe(
      data => {
        if (data['updated'] === true) {
          this.spinner.hide();
          this.billsService.ventaActualizada(data);
          this.mostrarMensajeExito('Factura Vinculada Exitosamente')
          this.submittedSuppliers = false;
          this.closeModalEvent.emit();
        }else{
          this.spinner.hide();
        }
      },
      error => {
        this.spinner.hide();
        this.mostrarMensajeError('Error al Vinculadar Factura');
        this.submittedSuppliers = false;
    });
  }

  vincularPurchaseOrder(id){
    this.ordersService.vincular(Number(this.user.user.company_id), id)
    .subscribe(
      data => {
        if (data['updated'] === true) {
          this.spinner.hide();
          this.ordersService.ordenCompraActualizada(data);
          this.mostrarMensajeExito('Orden de Compra Vinculada Exitosamente')
          this.submittedSuppliers = false;
          this.closeModalEvent.emit();
        }else{
          this.spinner.hide();
        }
      },
      error => {
        this.spinner.hide();
        this.mostrarMensajeError('Error al Vinculadar Orden de Compra');
        this.submittedSuppliers = false;
    });
  }

  mostrarMensajeExito(mensaje: string) {
    this.toastr.success(mensaje, 'Exito');
  }

  mostrarMensajeError(mensaje: string) {
    this.toastr.error(mensaje, 'Error');
  }

}
