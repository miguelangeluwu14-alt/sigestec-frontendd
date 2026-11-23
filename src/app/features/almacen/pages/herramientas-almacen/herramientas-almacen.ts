import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';
import { AccionesSeguras } from '../../../../shared/components/acciones-seguras/acciones-seguras';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, AccionesSeguras],
  templateUrl: './herramientas-almacen.html',
  styleUrl: './herramientas-almacen.css',
})
export class HerramientasAlmacen extends PaginaBase implements OnInit {
  movimientos = signal<any[]>([]);
  paginaMovimientos = 1;
  get numeroPaginasMovimientos(): number {
    return Math.max(1, Math.ceil(this.movimientos().length / this.tamanoPagina));
  }
  get paginasMovimientos(): number[] {
    return Array.from({ length: this.numeroPaginasMovimientos }, (_, i) => i + 1);
  }
  get movimientosPaginados(): any[] {
    const paginaActual = Math.min(this.paginaMovimientos, this.numeroPaginasMovimientos);
    return this.movimientos().slice((paginaActual - 1) * this.tamanoPagina, paginaActual * this.tamanoPagina);
  }
  irPaginaMovimientos(numero: number) {
    this.paginaMovimientos = Math.min(this.numeroPaginasMovimientos, Math.max(1, numero));
  }
  ordenes = signal<any[]>([]);
  empleados = signal<any[]>([]);
  nuevo = {
    nombre: '',
    descripcion: '',
    cantidadInicial: 0,
  };
  mov = {
    herramientaId: null as number | null,
    ordenTrabajoId: null as number | null,
    empleadoResponsableId: null as number | null,
    tipoMovimiento: 'PRESTAMO',
    cantidad: 1,
    estadoDevolucion: 'BUENO',
    observacion: '',
  };
  ngOnInit() {
    this.cargarItems('/almacen/herramientas');
    this.api
      .get<any[]>('/almacen/herramientas/movimientos')
      .subscribe({
        next: (x) => {
          this.movimientos.set(x);
          this.paginaMovimientos = Math.min(this.paginaMovimientos, this.numeroPaginasMovimientos);
        },
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
    this.api.get<any[]>('/ordenes-trabajo').subscribe({ next: (x) => this.ordenes.set(x) });
    this.api.get<any[]>('/personal').subscribe({ next: (x) => this.empleados.set(x) });
  }
  override textoBusqueda(x: any) {
    return `${x.codigo} ${x.nombre} ${x.descripcion}`;
  }
  get listado() {
    return this.route.snapshot.data['vista'] === 'listado';
  }
  get nuevoHerramienta() {
    return this.route.snapshot.data['vista'] === 'nueva-herramienta';
  }
  get seleccion() {
    return this.items().find((x) => x.id === this.mov.herramientaId);
  }
  get tecnicos() {
    return this.empleados().filter((x) => x.activo && x.perfil === 'TECNICO');
  }
  guardarHerramienta() {
    this.error.set('');
    if (!this.nuevo.nombre.trim() || this.nuevo.cantidadInicial < 0) {
      this.error.set('Indica nombre y cantidad inicial válida.');
      return;
    }
    this.protegidoCargando(
      this.api.post('/almacen/herramientas', this.nuevo),
      'Herramienta creada',
      '/almacen/herramientas',
    );
  }
  guardarMovimiento() {
    this.error.set('');
    if (!this.mov.herramientaId || this.mov.cantidad <= 0) {
      this.error.set('Selecciona herramienta y cantidad positiva.');
      return;
    }
    if (
      this.mov.tipoMovimiento !== 'INGRESO' &&
      (!this.mov.ordenTrabajoId || !this.mov.empleadoResponsableId)
    ) {
      this.error.set('Indica OT y técnico responsable para préstamo o devolución.');
      return;
    }
    const d = {
      ...this.mov,
      ordenTrabajoId: this.mov.tipoMovimiento === 'INGRESO' ? null : this.mov.ordenTrabajoId,
      empleadoResponsableId:
        this.mov.tipoMovimiento === 'INGRESO' ? null : this.mov.empleadoResponsableId,
    };
    this.protegidoCargando(
      this.api.post('/almacen/herramientas/movimientos', d),
      'Movimiento registrado',
      '/almacen/herramientas',
    );
  }
}
