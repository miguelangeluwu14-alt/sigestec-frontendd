import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';

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
    numeroActa: '',
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
    return `${x.numeroActa} ${x.ordenTrabajo?.id} ${x.ordenTrabajo?.solicitud?.cliente?.razonSocial} ${x.estadoConformidad}`;
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
      !this.form.numeroActa.trim() ||
      !this.form.nombreRepresentante.trim() ||
      !this.form.fechaConformidad ||
      !this.acta
    ) {
      this.error.set(
        'Completa OT, número de acta, representante, fecha y adjunta el acta firmada.',
      );
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
