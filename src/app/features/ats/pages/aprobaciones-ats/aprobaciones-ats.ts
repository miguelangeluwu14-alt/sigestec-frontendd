import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';
import { AccionesSeguras } from '../../../../shared/components/acciones-seguras/acciones-seguras';

@Component({
  standalone: true,
  imports: [DocumentoAdjunto, FormsModule, RouterLink, AccionesSeguras],
  templateUrl: './aprobaciones-ats.html',
  styleUrl: './aprobaciones-ats.css',
})
export class AprobacionesAts extends PaginaBase implements OnInit {
  ats = signal<any[]>([]);
  form = {
    atsId: null as number | null,
    supervisorCliente: '',
    ssomaCliente: '',
    fechaRevision: '',
    resultado: 'APROBADO',
    observaciones: '',
  };
  acta: File | null = null;
  ngOnInit() {
    this.cargarItems('/ats/aprobaciones');
    this.api.get<any[]>('/ats').subscribe({
      next: (x) => {
        this.ats.set(x);
        if (this.id) this.form.atsId = this.id;
      },
      error: (e) => this.error.set(this.api.mensaje(e)),
    });
  }
  override textoBusqueda(x: any) {
    return `${x.atsId} ${x.supervisorCliente} ${x.ssomaCliente} ${x.resultado}`;
  }
  get pendientes() {
    return this.ats().filter(
      (a) =>
        ['PENDIENTE', 'ELABORADO'].includes(a.estado) &&
        !this.items().some((r) => r.atsId === a.id),
    );
  }
  get actual() {
    return this.ats().find((a) => a.id === this.form.atsId);
  }
  archivo(e: Event) {
    this.acta = (e.target as HTMLInputElement).files?.item(0) || null;
  }
  descargar(a: any) {
    if (a.urlActa)
      this.api.descargar('/archivos/' + String(a.urlActa).split('/').pop(), 'acta-ats-' + a.atsId);
  }
  guardar() {
    this.error.set('');
    if (
      !this.form.atsId ||
      !this.form.supervisorCliente.trim() ||
      !this.form.ssomaCliente.trim() ||
      !this.form.fechaRevision
    ) {
      this.error.set('Indica el ATS, los representantes del cliente y la fecha de revisión.');
      return;
    }
    if (this.form.resultado === 'APROBADO' && !this.acta) {
      this.error.set('Adjunta el acta aprobada o firmada del cliente.');
      return;
    }
    if (this.form.resultado === 'RECHAZADO' && !this.form.observaciones.trim()) {
      this.error.set('Describe el motivo de rechazo.');
      return;
    }
    const fd = new FormData();
    const { atsId, ...datos } = this.form;
    fd.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
    if (this.acta) fd.append('acta', this.acta);
    this.protegidoCargando(
      this.api.put('/ats/' + atsId + '/aprobacion', fd),
      'Aprobación registrada',
      '/ats/aprobaciones',
    );
  }
}
