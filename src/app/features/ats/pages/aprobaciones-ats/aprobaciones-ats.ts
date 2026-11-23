import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';
import { desplazarDiaISO, fechaISO } from '../../../../core/utils/fechas-servicio';

@Component({
  standalone: true,
  imports: [DocumentoAdjunto, FormsModule, RouterLink],
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
    return `${x.atsNumero || ''} ${x.supervisorCliente} ${x.ssomaCliente} ${x.resultado}`;
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

  // El ATS expone fechaElaboracion y la OT expone inicio (YYYY-MM-DDTHH:mm:ss).
  get fechaRevisionMinima(): string {
    return fechaISO(this.actual?.fechaElaboracion);
  }

  get fechaInicioOT(): string {
    return fechaISO(this.actual?.ordenTrabajo?.inicio);
  }

  get fechaRevisionMaxima(): string {
    // La aprobación debe ser ANTERIOR al día de inicio de la OT.
    // No limitar a "hoy": permite programar una revisión en el intervalo válido.
    return desplazarDiaISO(this.fechaInicioOT, -1);
  }

  get rangoRevisionInvalido(): boolean {
    const minimo = this.fechaRevisionMinima;
    const maximo = this.fechaRevisionMaxima;
    return !!minimo && !!maximo && minimo > maximo;
  }

  seleccionarAts(id: number | null) {
    this.form.atsId = id;
    this.form.fechaRevision = '';
    this.error.set('');
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
    const minimo = this.fechaRevisionMinima;
    const inicioOT = this.fechaInicioOT;
    const maximo = this.fechaRevisionMaxima;
    if (!minimo) {
      this.error.set('No se pudo determinar la fecha de registro del ATS seleccionado.');
      return;
    }
    if (!inicioOT) {
      this.error.set('La orden de trabajo no tiene una fecha de inicio programada.');
      return;
    }
    if (this.rangoRevisionInvalido) {
      this.error.set('No existe una fecha válida: el ATS se registró el día de inicio de la OT o después.');
      return;
    }
    if (this.form.fechaRevision < minimo) {
      this.error.set(`La revisión no puede ser anterior al registro del ATS (${minimo}).`);
      return;
    }
    if (this.form.fechaRevision > maximo) {
      this.error.set(`La revisión debe realizarse antes del inicio de la OT (${inicioOT}); última fecha válida: ${maximo}.`);
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
