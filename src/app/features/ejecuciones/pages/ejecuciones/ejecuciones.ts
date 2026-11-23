import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';
import { AccionesSeguras } from '../../../../shared/components/acciones-seguras/acciones-seguras';

@Component({
  standalone: true,
  imports: [DocumentoAdjunto, FormsModule, RouterLink, AccionesSeguras],
  templateUrl: './ejecuciones.html',
  styleUrl: './ejecuciones.css',
})
export class Ejecuciones extends PaginaBase implements OnInit {
  private cdr=inject(ChangeDetectorRef);
  ordenes = signal<any[]>([]);
  ats = signal<any[]>([]);
  materiales = signal<any[]>([]);
  form: any = {
    ordenTrabajoId: null,
    descripcion: '',
    mediciones: '',
    observaciones: '',
    materiales: [] as {
      materialId: number | null;
      cantidadReal: number;
    }[],
  };
  fotos: Record<'antes' | 'durante' | 'despues', File | null> = {
    antes: null,
    durante: null,
    despues: null,
  };
  ngOnInit() {
    this.cargarItems('/ejecuciones');
    if(this.esEdicion) this.api.get<any[]>('/ejecuciones').subscribe({
      next: lista=>{
        const x=lista.find(v=>v.id===this.id);
        if(!x){this.error.set('Ejecución no encontrada');return;}
        this.form={ordenTrabajoId:x.ordenTrabajo?.id,descripcion:x.descripcion||'',
          mediciones:x.mediciones||'',observaciones:x.observaciones||'',
          materiales:[]};
        this.cdr.markForCheck();
      }, error:e=>this.error.set(this.api.mensaje(e)),
    });
    this.api
      .get<any[]>('/ordenes-trabajo')
      .subscribe({
        next: (x) => this.ordenes.set(x),
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
    this.api.get<any[]>('/ats').subscribe({ next: (x) => this.ats.set(x) });
    this.api.get<any[]>('/almacen/materiales').subscribe({ next: (x) => this.materiales.set(x) });
  }
  override textoBusqueda(x: any) {
    return `${x.numeroEjecucion || ''} ${x.ordenTrabajo?.numero || ''} ${x.ordenTrabajo?.solicitud?.cliente?.razonSocial} ${x.descripcion}`;
  }
  get elegibles() {
    return this.ordenes().filter(
      (o) =>
        o.estado === 'PROGRAMADA' &&
        this.ats().some((a) => a.ordenTrabajo?.id === o.id && a.estado === 'APROBADO') &&
        !this.items().some((e) => e.ordenTrabajo.id === o.id),
    );
  }
  get actual() {
    return this.ordenes().find((x) => x.id === this.form.ordenTrabajoId);
  }
  agregarMaterial() {
    this.form.materiales.push({ materialId: null, cantidadReal: 1 });
  }
  quitarMaterial(i: number) {
    this.form.materiales.splice(i, 1);
  }
  archivo(e: Event, t: 'antes' | 'durante' | 'despues') {
    this.fotos[t] = (e.target as HTMLInputElement).files?.item(0) || null;
  }
  descargar(url: string, nombre: string) {
    if (url) this.api.descargar('/archivos/' + url.split('/').pop(), nombre);
  }
  guardar() {
    this.error.set('');
    if (this.esEdicion) {
      if(!this.form.descripcion.trim()){this.error.set('La descripción es obligatoria');return;}
      this.protegidoCargando(this.api.put('/gestion/ejecuciones/'+this.id,{
        descripcion:this.form.descripcion,mediciones:this.form.mediciones,
        observaciones:this.form.observaciones,
      }),'Ejecución corregida','/ejecuciones');
      return;
    }
    if (!this.form.ordenTrabajoId || !this.form.descripcion.trim()) {
      this.error.set('Selecciona una OT con ATS aprobado y describe el trabajo ejecutado.');
      return;
    }
    if (!Object.values(this.fotos).some((x) => !!x)) {
      this.error.set('Adjunta al menos una fotografía de evidencia.');
      return;
    }
    if (this.form.materiales.some((x: any) => !x.materialId || x.cantidadReal <= 0)) {
      this.error.set('Completa los materiales utilizados y sus cantidades positivas.');
      return;
    }
    const fd = new FormData();
    fd.append('datos', new Blob([JSON.stringify(this.form)], { type: 'application/json' }));
    for (const t of ['antes', 'durante', 'despues'] as const) {
      if (this.fotos[t]) fd.append(t, this.fotos[t]!);
    }
    this.protegidoCargando(
      this.api.post('/ejecuciones', fd),
      'Ejecución registrada',
      '/ejecuciones',
    );
  }
}
