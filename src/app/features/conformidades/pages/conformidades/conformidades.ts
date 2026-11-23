import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';
import { fechaISO } from '../../../../core/utils/fechas-servicio';

@Component({
  standalone: true,
  imports: [DocumentoAdjunto, FormsModule, RouterLink],
  templateUrl: './conformidades.html',
  styleUrl: './conformidades.css',
})
export class Conformidades extends PaginaBase implements OnInit {
  informes = signal<any[]>([]);
  form = {
    ordenTrabajoId: null as number | null,
    fechaConformidad: '',
    nombreRepresentante: '',
    representanteEmpresaId: null as number | null,
    valoracion: 5,
    estadoConformidad: 'CONFORME',
    observaciones: '',
  };
  acta: File | null = null;
  ngOnInit() {
    this.cargarItems('/conformidades');
    this.api
      .get<any[]>('/informes')
      .subscribe({
        next: (x) => this.informes.set(x),
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
  }
  override textoBusqueda(x: any) {
    return `${x.numeroActa} ${x.ordenTrabajo?.numero || ''} ${x.ordenTrabajo?.solicitud?.cliente?.razonSocial} ${x.estadoConformidad}`;
  }
  get elegibles() {
    return this.informes().filter(
      (i) =>
        i.estado === 'ENVIADO' &&
        !this.items().some((c) => c.ordenTrabajo?.id === i.ordenTrabajo?.id),
    );
  }
  get actual() {
    return this.informes().find((i) => i.ordenTrabajo?.id === this.form.ordenTrabajoId);
  }
  get fechaMinimaConformidad(): string {
    return fechaISO(this.actual?.fechaEnvio);
  }
  seleccionarOt(id: number | null) {
    this.form.ordenTrabajoId = id;
    this.form.fechaConformidad = '';
    this.error.set('');
  }
  archivo(e: Event) {
    this.acta = (e.target as HTMLInputElement).files?.item(0) || null;
  }
  descargar(c: any) {
    if (c.urlArchivo)
      this.api.descargar(
        '/archivos/' + String(c.urlArchivo).split('/').pop(),
        'acta-conformidad-' + c.id,
      );
  }
  guardar() {
    this.error.set('');
    if (
      !this.form.ordenTrabajoId ||
      !this.form.nombreRepresentante.trim() ||
      !this.form.fechaConformidad ||
      !this.acta
    ) {
      this.error.set(
        'Completa OT, representante y fecha; además, adjunta el acta firmada.',
      );
      return;
    }
    if (!this.actual || this.actual.estado !== 'ENVIADO') {
      this.error.set('Selecciona una OT con informe técnico enviado.');
      return;
    }
    if (!this.fechaMinimaConformidad) {
      this.error.set('No se encontró la fecha de envío del informe técnico.');
      return;
    }
    if (this.form.fechaConformidad < this.fechaMinimaConformidad) {
      this.error.set(`La fecha de conformidad no puede ser anterior al envío del informe (${this.fechaMinimaConformidad}).`);
      return;
    }
    const fd = new FormData();
    fd.append('datos', new Blob([JSON.stringify(this.form)], { type: 'application/json' }));
    fd.append('acta', this.acta);
    this.protegidoCargando(
      this.api.post('/conformidades', fd),
      'Conformidad registrada',
      '/conformidades',
    );
  }
}
