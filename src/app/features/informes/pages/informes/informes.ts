import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';
import { AccionesSeguras } from '../../../../shared/components/acciones-seguras/acciones-seguras';
import { desplazarDiaISO, fechaISO } from '../../../../core/utils/fechas-servicio';

@Component({
  standalone: true,
  imports: [DocumentoAdjunto, FormsModule, RouterLink, AccionesSeguras],
  templateUrl: './informes.html',
  styleUrl: './informes.css',
})
export class Informes extends PaginaBase implements OnInit {
  private cdr=inject(ChangeDetectorRef);
  ejecuciones = signal<any[]>([]);
  form = {
    ordenTrabajoId: null as number | null,
    diagnostico: '',
    trabajosRealizados: '',
    conclusiones: '',
    recomendaciones: '',
    fechaEnvio: '',
  };
  pdf: File | null = null;
  quitarPdf = false;
  fotos: File[] = [];
  ngOnInit() {
    this.cargarItems('/informes');
    if (this.esEdicion) this.api.get<any[]>('/informes').subscribe({
      next: lista=>{
        const x=lista.find(v=>v.id===this.id);
        if(!x){this.error.set('Informe no encontrado');return;}
        this.form={ordenTrabajoId:x.ordenTrabajo?.id,
          diagnostico:x.diagnostico||'',trabajosRealizados:x.trabajosRealizados||'',
          conclusiones:x.conclusiones||'',recomendaciones:x.recomendaciones||'',
          fechaEnvio:String(x.fechaEnvio||'')};
        this.cdr.markForCheck();
      },error:e=>this.error.set(this.api.mensaje(e)),
    });
    this.api
      .get<any[]>('/ejecuciones')
      .subscribe({
        next: (x) => this.ejecuciones.set(x),
        error: (e) => this.error.set(this.api.mensaje(e)),
      });
  }
  override textoBusqueda(x: any) {
    return `${x.numeroInforme} ${x.ordenTrabajo?.numero || ''} ${x.ordenTrabajo?.solicitud?.cliente?.razonSocial} ${x.conclusiones}`;
  }
  get elegibles() {
    return this.ejecuciones().filter(
      (e) => !this.items().some((i) => i.ordenTrabajo.id === e.ordenTrabajo?.id),
    );
  }
  get actual() {
    return this.ejecuciones().find((e) => e.ordenTrabajo?.id === this.form.ordenTrabajoId);
  }
  get fechaFinOT(): string {
    return fechaISO(this.actual?.ordenTrabajo?.fin);
  }
  get fechaMinimaInforme(): string {
    // El formulario almacena solo una fecha (sin hora): primer día posterior al fin de la OT.
    return desplazarDiaISO(this.fechaFinOT, 1);
  }
  seleccionarOt(id: number | null) {
    this.form.ordenTrabajoId = id;
    this.form.fechaEnvio = '';
    this.error.set('');
  }
  archivo(e: Event) {
    this.pdf = (e.target as HTMLInputElement).files?.item(0) || null;
    if(this.pdf)this.quitarPdf=false;
  }
  quitarFoto(i: number) { this.fotos.splice(i, 1); }
  fotosSeleccionadas(e: Event) {
    this.fotos = Array.from((e.target as HTMLInputElement).files || []);
  }
  descargar(url: string, nombre: string) {
    if (url) this.api.descargar('/archivos/' + url.split('/').pop(), nombre);
  }
  guardar() {
    this.error.set('');
    if (this.esEdicion) {
      if (!this.form.diagnostico.trim() || !this.form.trabajosRealizados.trim() || !this.form.conclusiones.trim()) {
        this.error.set('Completa diagnóstico, trabajos realizados y conclusiones');return;
      }
      this.guardarCorreccionConArchivo('informes',this.id,{
        diagnostico:this.form.diagnostico,trabajosRealizados:this.form.trabajosRealizados,
        conclusiones:this.form.conclusiones,recomendaciones:this.form.recomendaciones,
      },this.pdf,this.quitarPdf,'/informes');
      return;
    }
    if (
      !this.form.ordenTrabajoId ||
      !this.form.diagnostico.trim() ||
      !this.form.trabajosRealizados.trim() ||
      !this.form.conclusiones.trim() ||
      !this.form.fechaEnvio
    ) {
      this.error.set(
        'Selecciona la OT ejecutada y completa diagnóstico, trabajos, conclusiones y fecha de envío.',
      );
      return;
    }
    if (!this.actual) {
      this.error.set('Selecciona una OT con ejecución registrada.');
      return;
    }
    if (!this.fechaMinimaInforme) {
      this.error.set('La OT no tiene fecha de finalización programada.');
      return;
    }
    if (this.form.fechaEnvio < this.fechaMinimaInforme) {
      this.error.set(`La fecha de envío debe ser posterior a la finalización del trabajo (desde ${this.fechaMinimaInforme}).`);
      return;
    }
    const fd = new FormData();
    fd.append('datos', new Blob([JSON.stringify(this.form)], { type: 'application/json' }));
    if (this.pdf) fd.append('pdf', this.pdf);
    for (const foto of this.fotos) fd.append('fotos', foto);
    this.protegidoCargando(this.api.post('/informes', fd), 'Informe registrado', '/informes');
  }
}
