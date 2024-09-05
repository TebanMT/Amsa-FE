import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SuppliersService } from "../../_services/suppliers.service";
import { AuthenticationService } from '../../_services/authentication.service';
import { first } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {

  suppliers: any[] = [];
  activeSuppliers: any[] = [];
  dectiveSuppliers: any[] = [];
  numberPages: number = 0;
  searchText: string = "";
  supplier: any = {}
  currentUser: any;
  companyID: any;
  selectedOption: any;
  propertyName: any = "Name";
  

  @ViewChild('nuevoProveedorModal', { static: false }) nuevoClienteModal: any;
  @ViewChild('editarModal', { static: false }) editarModal: any;

  @ViewChild('eliminarProveedorModal',  { static: false }) eliminarClienteModal: ElementRef;

  constructor(
    private renderer: Renderer2,
    private toastr: ToastrService,
    private supplierService: SuppliersService,
    private authenticationService: AuthenticationService,
    private spinner: NgxSpinnerService) {
      this.currentUser = this.authenticationService.currentUserValue;
      this.companyID = Number(this.currentUser.user.company_id);
      this.loadData();
      this.supplierService.supplierActualizado$.subscribe(supplier => {
        if (supplier) {
          this.loadData()
        }
      });
    }

  ngOnInit() {
  }

  selectTableView(changes): void {
    if(changes === 'inactivos'){
      this.suppliers = this.dectiveSuppliers;
      this.numberPages = Math.ceil(this.dectiveSuppliers.length / 10);
    }else{
      this.suppliers = this.activeSuppliers;
      this.numberPages = Math.ceil(this.activeSuppliers.length / 10);
    }
  }

  loadData() {
    this.spinner.show();
    this.supplierService.getAll(this.companyID)
      .subscribe(
        data => {
          if (data) {
            this.activeSuppliers = data.filter(supplier => supplier.Activated && supplier.Activated === true);
            this.dectiveSuppliers = data.filter(supplier => supplier.Activated && supplier.Activated === false);
            this.numberPages = Math.ceil(this.activeSuppliers.length / 10);
            this.suppliers = this.activeSuppliers;
          }
          this.spinner.hide();
        },
        error => {
          this.spinner.hide();
          this.mostrarMensajeError('Error al Obtener los Proveedores');
      });
  }

  get pages(): number[] {
    return Array.from({length: this.numberPages}, (v, k) => k + 1);
  }

  setSuppliers(supplier: any){
    this.supplier = supplier
  }

  closeModal() {
    this.renderer.setStyle(this.nuevoClienteModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();

  }

  closeModalEditar() {
    this.renderer.setStyle(this.editarModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();

  }

  abrirModalEliminar(supplier) {
    this.supplier = supplier
    this.eliminarClienteModal.nativeElement.style.display = 'block';
  }

  cerrarModalEliminar() {
    this.renderer.setStyle(this.eliminarClienteModal.nativeElement, 'display', 'none');
    this.removeModalBackdrop();
  }

  confirmarEliminacion() {
    this.spinner.show();
    this.supplierService.deactivate(this.supplier.ID)
    .pipe(first())
    .subscribe(
      data => {
        if (data['deactivate']) {
          this.loadData();
          this.mostrarMensajeExito('Cliente Eliminado Exitosamente');
          this.cerrarModalEliminar();
        }else{
          this.loadData()
          this.mostrarMensajeError("Error al Eliminar el Cliente");
          this.cerrarModalEliminar();
        }
        this.spinner.hide();
      },
      error => {
        this.loadData()
        this.mostrarMensajeError("Error al Eliminar el Cliente");
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

