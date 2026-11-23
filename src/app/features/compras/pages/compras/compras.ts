import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';
import { AccionesSeguras } from '../../../../shared/components/acciones-seguras/acciones-seguras';

type DetalleCompra = { descripcion: string; cantidad: number; precioUnitario: number; unidadMedida: string };

@Component({
  standalone: true,
  imports: [DocumentoAdjunto, FormsModule, RouterLink, AccionesSeguras],
  templateUrl: './compras.html',
  styleUrl: './compras.css',
})
export class Compras extends PaginaBase implements OnInit {
  private cdr=inject(ChangeDetectorRef);
  cotizaciones = signal<any[]>([]);
  form = {
    cotizacionId: null as number | null,
    numero: '',
    fechaEmision: '',
    montoTotal: 0,
  };
  pdf: File | null = null;
  quitarPdf = false;
  detalles: DetalleCompra[] = [];
  ngOnInit() {
    this.cargarItems('/ordenes-compra');
    if (this.esEdicion) this.api.get<any[]>('/ordenes-compra').subscribe({
      next: registros => {
        const x = registros.find(v => v.id === this.id);
        if (!x) { this.error.set('Orden de compra no encontrada'); return; }
        this.form = {cotizacionId:x.cotizacion?.id||null,numero:x.numero,
          fechaEmision:String(x.fechaEmision||''),montoTotal:Number(x.montoTotal)};
        this.detalles = (x.detalles||[]).map((d:any)=>({
          descripcion:d.descripcion,cantidad:Number(d.cantidad),
          precioUnitario:Number(d.precioUnitario),unidadMedida:d.unidadMedida||'SERVICIO',
        }));
        this.cdr.markForCheck();
      },error:e=>this.error.set(this.api.mensaje(e)),
    });
    this.api
      .get<any[]>('/cotizaciones')
      .subscribe({
        next: (x) => this.cotizaciones.set(x),
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
  }
  override textoBusqueda(x: any) {
    return `${x.codigo || ''} ${x.numero} ${x.cotizacion?.numero || ''} ${x.cotizacion?.solicitud?.cliente?.razonSocial}`;
  }
  override estadoDe(x: any) {
    return x.cotizacion?.estado || '';
  }
  get registroActual() {
    return this.items().find((x) => x.id === this.id);
  }
  get aceptadas() {
    return this.cotizaciones().filter(
      (c) => c.estado === 'ACEPTADA' && !this.items().some((oc) => oc.cotizacion.id === c.id),
    );
  }
  get actual() {
    return this.cotizaciones().find((c) => c.id === this.form.cotizacionId);
  }
  seleccionarCotizacion() {
    this.form.montoTotal = this.actual?.monto || 0;
    this.detalles = (this.actual?.detalles || []).map((x: any) => ({
      descripcion: x.descripcion,
      cantidad: Number(x.cantidad),
      precioUnitario: Number(x.precioUnitario),
      unidadMedida: x.unidadMedida || 'SERVICIO',
    }));
  }
  archivo(e: Event) {
    this.pdf = (e.target as HTMLInputElement).files?.item(0) || null;
  }
  guardar() {
    if (this.esEdicion) {
      if (!this.form.numero.trim()) { this.error.set('Indica el número de orden'); return; }
      this.guardarCorreccionConArchivo('compras', this.id, {numero:this.form.numero},
        this.pdf, false, '/compras');
      return;
    }
    if (
      !this.form.cotizacionId ||
      !this.form.numero.trim() ||
      !this.form.fechaEmision ||
      !(this.form.montoTotal > 0)
    ) {
      this.error.set('Completa los campos obligatorios de la orden de compra.');
      return;
    }
    if (this.detalles.some(d => !d.descripcion.trim() || !(d.cantidad > 0) || d.precioUnitario < 0)) {
      this.error.set('Revisa las descripciones, cantidades y precios de los detalles antes de registrar la orden.');
      return;
    }
    if (
      !this.pdf ||
      !(this.pdf.type === 'application/pdf' || this.pdf.name.toLowerCase().endsWith('.pdf')) ||
      this.pdf.size > 8 * 1024 * 1024
    ) {
      this.error.set('Adjunta un PDF válido de hasta 8 MB.');
      return;
    }
    const fd = new FormData();
    for (const k of ['cotizacionId', 'numero', 'fechaEmision', 'montoTotal'] as const)
      fd.append(k, String(this.form[k]));
    fd.append('pdf', this.pdf);
    fd.append('detallesJson', JSON.stringify(this.detalles));
    this.protegidoCargando(this.api.post('/ordenes-compra', fd), 'Orden registrada', '/compras');
  }
  descargar(c: any) {
    this.api.descargar('/ordenes-compra/' + c.id + '/pdf', c.nombrePdf || 'orden-compra.pdf');
  }
}
