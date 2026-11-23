import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';

@Component({
  standalone: true,
  imports: [DocumentoAdjunto, FormsModule, RouterLink],
  templateUrl: './asignaciones.html',
  styleUrl: './asignaciones.css',
})
export class Asignaciones extends PaginaBase implements OnInit {
  solicitudes = signal<any[]>([]);
  compras = signal<any[]>([]);
  personal = signal<any[]>([]);
  form = {
    solicitudId: null as number | null,
    tecnicoId: null as number | null,
    ssomaId: null as number | null,
    apoyoId: null as number | null,
    tecnicosAdicionales: [] as number[],
  };
  ngOnInit() {
    this.api.get<any[]>('/ordenes-trabajo').subscribe({
      next: (x) => {
        this.items.set(x);
        if (this.esEdicion) {
          const r = x.find((o) => o.id === this.id);
          if (r)
            this.form = {
              solicitudId: r.solicitud.id,
              tecnicoId: r.tecnico.id,
              ssomaId: r.ssoma.id,
              apoyoId: r.apoyo?.id || null,
              tecnicosAdicionales: (r.tecnicos || [])
                .filter((t: any) => t.id !== r.tecnico?.id)
                .map((t: any) => t.id),
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
    this.api
      .get<any[]>('/ordenes-compra')
      .subscribe({
        next: (x) => this.compras.set(x),
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
    this.api
      .get<any[]>('/personal')
      .subscribe({
        next: (x) => this.personal.set(x),
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
  }
  override textoBusqueda(x: any) {
    return `${x.numero || ''} ${x.solicitud?.codigo || ''} ${x.solicitud?.cliente?.razonSocial} ${x.tecnico?.nombre} ${x.ssoma?.nombre}`;
  }
  get registroActual() {
    return this.items().find((o) => o.id === this.id);
  }
  get pendientes() {
    return this.solicitudes().filter(
      (s) =>
        this.compras().some((c) => c.cotizacion.solicitud.id === s.id) &&
        !this.items().some((o) => o.solicitud.id === s.id),
    );
  }
  por(perfil: string) {
    return this.personal().filter((p) => p.perfil === perfil && p.activo);
  }
  get cargas() {
    return this.items().filter((o) =>
      (o.tecnicos || []).some((t: any) => t.id === this.form.tecnicoId),
    ).length;
  }
  marcarTecnico(id: number, event: Event) {
    const s = new Set(this.form.tecnicosAdicionales);
    (event.target as HTMLInputElement).checked ? s.add(id) : s.delete(id);
    this.form.tecnicosAdicionales = [...s];
  }
  guardar() {
    if (!this.form.tecnicoId || !this.form.ssomaId || (!this.esEdicion && !this.form.solicitudId)) {
      this.error.set('Selecciona la solicitud, el técnico responsable y el personal SSOMA.');
      return;
    }
    const req = this.esEdicion
      ? this.api.put('/ordenes-trabajo/' + this.id + '/equipo', {
          tecnicoId: this.form.tecnicoId,
          ssomaId: this.form.ssomaId,
          apoyoId: this.form.apoyoId,
          tecnicosAdicionales: this.form.tecnicosAdicionales,
        })
      : this.api.post('/ordenes-trabajo', this.form);
    this.protegidoCargando(req, 'Asignación registrada', '/asignaciones');
  }
}
