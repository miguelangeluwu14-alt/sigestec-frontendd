import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';
type Linea = {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  // Campo interno conservado para compatibilidad con datos históricos; no aparece en el formulario.
  unidadMedida?: string;
};
@Component({
  standalone: true,
  imports: [DocumentoAdjunto, FormsModule, RouterLink],
  templateUrl: './cotizaciones.html',
  styleUrl: './cotizaciones.css',
})
export class Cotizaciones extends PaginaBase implements OnInit {
  solicitudes = signal<any[]>([]);
  pdf: File | null = null;
  quitarPdf = false;
  form: {
    solicitudId: number | null;
    descripcionTrabajo: string;
    observaciones: string;
    detalles: Linea[];
  } = {
    solicitudId: null,
    descripcionTrabajo: '',
    observaciones: '',
    detalles: [
      {
        descripcion: '',
        cantidad: 1,
        precioUnitario: 0,
        unidadMedida: 'SERVICIO',
      },
    ],
  };
  ngOnInit() {
    this.api.get<any[]>('/cotizaciones').subscribe({
      next: (x) => {
        this.items.set(x);
        if (this.esEdicion) {
          const c = x.find((y) => y.id === this.id);
          if (c)
            this.form = {
              solicitudId: c.solicitud.id,
              descripcionTrabajo: c.descripcionTrabajo || '',
              observaciones: c.observaciones || '',
              detalles: (c.detalles || []).map((d: any) => ({
                descripcion: d.descripcion,
                cantidad: Number(d.cantidad),
                precioUnitario: Number(d.precioUnitario),
                unidadMedida: d.unidadMedida || 'SERVICIO',
              })),
            };
        }
      },
      error: (e) => this.error.set(this.api.mensaje(e)),
    });
    this.api
      .get<any[]>('/solicitudes')
      .subscribe({
        next: (x) => this.solicitudes.set(x),
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
  }
  override textoBusqueda(x: any) {
    return `${x.numero || ''} ${x.id} ${x.solicitud?.cliente?.razonSocial || ''} ${x.descripcionTrabajo || ''}`;
  }
  get pendientes() {
    return this.solicitudes().filter((s) => ['PENDIENTE', 'COTIZADA'].includes(s.estado));
  }
  get solicitada() {
    return this.solicitudes().find((s) => s.id === this.form.solicitudId);
  }
  get subtotal() {
    return this.form.detalles.reduce(
      (s, d) => s + Number(d.cantidad || 0) * Number(d.precioUnitario || 0),
      0,
    );
  }
  get igv() {
    return Math.round(this.subtotal * 0.18 * 100) / 100;
  }
  get monto() {
    return Math.round((this.subtotal + this.igv) * 100) / 100;
  }
  archivo(e: Event) {
    this.pdf = (e.target as HTMLInputElement).files?.item(0) || null;
    if(this.pdf)this.quitarPdf=false;
  }
  agregarDetalle() {
    this.form.detalles.push({
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      unidadMedida: 'SERVICIO',
    });
  }
  quitarDetalle(i: number) {
    if (this.form.detalles.length > 1) this.form.detalles.splice(i, 1);
  }
  guardar() {
    if (
      !this.form.solicitudId ||
      !this.form.detalles.length ||
      this.form.detalles.some(
        (d) => !d.descripcion.trim() || !(d.cantidad > 0) || d.precioUnitario < 0,
      ) ||
      !(this.monto > 0)
    ) {
      this.error.set(
        'Selecciona la solicitud y registra al menos un detalle con descripción, cantidad y precio válidos.',
      );
      return;
    }
    const datos = { ...this.form, descripcionTrabajo: this.form.detalles[0].descripcion };
    const fd = new FormData();
    fd.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
    if (this.pdf) fd.append('pdf', this.pdf);
    if (this.esEdicion) fd.append('quitarPdf', String(this.quitarPdf));
    const req = this.esEdicion
      ? this.api.put('/cotizaciones/' + this.id, fd)
      : this.api.post('/cotizaciones', fd);
    this.protegidoCargando(req, 'Cotización guardada', '/cotizaciones');
  }
  descargarPDF(c: any) {
    const file = String(c.urlArchivo || '')
      .split('/')
      .pop();
    if (file) this.api.descargar('/archivos/' + file, 'cotizacion-' + c.id + '.pdf');
  }
  estado(c: any, estado: string) {
    this.error.set('');
    this.api.patch('/cotizaciones/' + c.id + '/estado', { estado }).subscribe({
      next: () => {
        this.ok.set('Respuesta del cliente registrada.');
        this.cargarItems('/cotizaciones');
      },
      error: (e) => this.error.set(this.api.mensaje(e)),
    });
  }
}
