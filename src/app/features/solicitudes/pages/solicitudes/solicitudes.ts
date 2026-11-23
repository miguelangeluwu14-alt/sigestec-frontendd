import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';
import { AccionesSeguras } from '../../../../shared/components/acciones-seguras/acciones-seguras';

@Component({
  standalone: true,
  imports: [DocumentoAdjunto, FormsModule, RouterLink, AccionesSeguras],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class Solicitudes extends PaginaBase implements OnInit {
  private cdr=inject(ChangeDetectorRef);
  clientes = signal<any[]>([]);
  tipos = signal<any[]>([]);
  pdf: File | null = null;
  quitarPdf = false;
  form = {
    clienteId: null as number | null,
    tipoServicioId: null as number | null,
    descripcion: '',
    observaciones: '',
  };
  ngOnInit() {
    this.cargarItems('/solicitudes');
    if (this.esEdicion) this.api.get<any[]>('/solicitudes').subscribe({
      next: (registros) => {
        const x = registros.find(v => v.id === this.id);
        if (!x) { this.error.set('Solicitud no encontrada'); return; }
        this.form = {
          clienteId: x.cliente?.id || null,
          tipoServicioId: x.tipoServicio?.id || null,
          descripcion: x.descripcion || '',
          observaciones: x.observaciones || '',
        };
        this.cdr.markForCheck();
      },
      error: (e) => this.error.set(this.api.mensaje(e)),
    });
    this.api
      .get<any[]>('/clientes')
      .subscribe({
        next: (x) => this.clientes.set(x),
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
    this.api
      .get<any[]>('/tipos-servicio')
      .subscribe({
        next: (x) => this.tipos.set(x),
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
  }
  override textoBusqueda(x: any) {
    return `${x.codigo || ''} ${x.id} ${x.cliente?.razonSocial || ''} ${x.tipoServicio?.nombre || ''} ${x.descripcion || ''}`;
  }
  get clientesActivos() {
    return this.clientes().filter((c) => c.estado !== 'I');
  }
  get tiposActivos() {
    return this.tipos().filter((t) => t.estado !== 'I');
  }
  get fechaHoy() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }
  codigo(i: any) {
    return i.codigo || 'Código pendiente';
  }
  archivo(e: Event) {
    this.pdf = (e.target as HTMLInputElement).files?.item(0) || null;
    if (this.pdf) this.quitarPdf = false;
  }
  guardar() {
    if (this.esEdicion) {
      if (!this.form.descripcion.trim()) { this.error.set('La descripción es obligatoria'); return; }
      this.guardarCorreccionConArchivo('solicitudes', this.id, {
        descripcion: this.form.descripcion, observaciones: this.form.observaciones,
      }, this.pdf, this.quitarPdf, '/solicitudes');
      return;
    }
    if (!this.form.clienteId || !this.form.tipoServicioId || !this.form.descripcion.trim()) {
      this.error.set('Completa el cliente, tipo de servicio y descripción del trabajo.');
      return;
    }
    const fd = new FormData();
    fd.append('datos', new Blob([JSON.stringify(this.form)], { type: 'application/json' }));
    if (this.pdf) fd.append('pdf', this.pdf);
    this.protegidoCargando(
      this.api.post('/solicitudes', fd),
      'Solicitud registrada',
      '/solicitudes',
    );
  }
}
