import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';
import { AccionesSeguras } from '../../../../shared/components/acciones-seguras/acciones-seguras';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, AccionesSeguras],
  templateUrl: './materiales-almacen.html',
  styleUrl: './materiales-almacen.css',
})
export class MaterialesAlmacen extends PaginaBase implements OnInit {
  movimientos = signal<any[]>([]);
  ordenes = signal<any[]>([]);
  nuevo = {
    codigo: '',
    nombre: '',
    unidadMedida: 'UNIDAD',
    stockInicial: 0,
    stockMinimo: 0,
  };
  mov = {
    materialId: null as number | null,
    ordenTrabajoId: null as number | null,
    tipoMovimiento: 'SALIDA',
    cantidad: 1,
    motivo: '',
    observacion: '',
  };
  ngOnInit() {
    this.cargarItems('/almacen/materiales');
    this.api
      .get<any[]>('/almacen/movimientos')
      .subscribe({
        next: (x) => this.movimientos.set(x),
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
    this.api.get<any[]>('/ordenes-trabajo').subscribe({ next: (x) => this.ordenes.set(x) });
  }
  override textoBusqueda(x: any) {
    return `${x.codigo} ${x.nombre} ${x.unidadMedida}`;
  }
  get vistaAlmacen() {
    return this.route.snapshot.data['vista'] || 'listado';
  }
  get listado() {
    return this.vistaAlmacen === 'listado';
  }
  get nuevoMaterial() {
    return this.vistaAlmacen === 'nuevo-material';
  }
  get materialSeleccionado() {
    return this.items().find((x) => x.id === this.mov.materialId);
  }
  guardarMaterial() {
    this.error.set('');
    if (
      !this.nuevo.codigo.trim() ||
      !this.nuevo.nombre.trim() ||
      !this.nuevo.unidadMedida.trim() ||
      this.nuevo.stockInicial < 0 ||
      this.nuevo.stockMinimo < 0
    ) {
      this.error.set('Completa código, nombre, unidad y stocks válidos.');
      return;
    }
    this.protegidoCargando(
      this.api.post('/almacen/materiales', this.nuevo),
      'Material creado',
      '/almacen/materiales',
    );
  }
  guardarMovimiento() {
    this.error.set('');
    if (!this.mov.materialId || this.mov.cantidad <= 0) {
      this.error.set('Selecciona un material y una cantidad positiva.');
      return;
    }
    if (this.mov.tipoMovimiento !== 'ENTRADA' && !this.mov.ordenTrabajoId) {
      this.error.set('Selecciona una OT para salidas y devoluciones.');
      return;
    }
    const datos = {
      ...this.mov,
      ordenTrabajoId: this.mov.tipoMovimiento === 'ENTRADA' ? null : this.mov.ordenTrabajoId,
    };
    this.protegidoCargando(
      this.api.post('/almacen/movimientos', datos),
      'Movimiento registrado',
      '/almacen/materiales',
    );
  }
}
