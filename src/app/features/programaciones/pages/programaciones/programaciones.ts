import { DocumentoAdjunto } from '../../../../shared/components/documento-adjunto/documento-adjunto';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../../../../shared/pages/pagina-base';

@Component({
  standalone: true,
  imports: [DocumentoAdjunto, FormsModule, RouterLink],
  templateUrl: './programaciones.html',
  styleUrl: './programaciones.css',
})
export class Programaciones extends PaginaBase implements OnInit {
  idOrden: number | null = null;
  form = {
    inicio: '',
    fin: '',
    lugar: '',
    fechaEnvio: '',
    aprobadoCliente: false,
    motivoCambio: '',
  };
  // El control datetime-local utiliza hora local (sin conversión a UTC).
  // Redondeamos al siguiente minuto: así nunca se ofrece una hora ya transcurrida.
  minimoInicio = this.fechaHoraLocal(Math.ceil(Date.now() / 60_000) * 60_000);

  get minimoFin(): string {
    const inicio = new Date(this.form.inicio).getTime();
    const minimoActual = new Date(this.minimoInicio).getTime();
    const minimoPermitido = Number.isFinite(inicio)
      ? Math.max(inicio + 60_000, minimoActual)
      : minimoActual;
    return this.fechaHoraLocal(minimoPermitido);
  }

  actualizarLimitesFechas(): void {
    // Se actualiza al abrir cada selector, aunque el formulario lleve tiempo abierto.
    this.minimoInicio = this.fechaHoraLocal(Math.ceil(Date.now() / 60_000) * 60_000);
  }

  private fechaHoraLocal(instante: number): string {
    const fecha = new Date(instante);
    const dosDigitos = (numero: number) => String(numero).padStart(2, '0');
    return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}T${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
  }

  archivos: Record<'pt' | 'iper' | 'croquis', File | null> = {
    pt: null,
    iper: null,
    croquis: null,
  };
  ngOnInit() {
    this.api.get<any[]>('/ordenes-trabajo').subscribe({
      next: (x) => {
        this.items.set(x);
        if (this.esEdicion) {
          const o = x.find((t) => t.id === this.id);
          if (o) this.elegir(o);
        }
      },
      error: (e) => this.error.set(this.api.mensaje(e)),
    });
  }
  override textoBusqueda(x: any) {
    return `${x.numero || ''} ${x.solicitud?.codigo || ''} ${x.solicitud?.cliente?.razonSocial} ${x.tecnico?.nombre} ${x.lugar || ''}`;
  }
  get actual() {
    return this.items().find((o) => o.id === this.idOrden);
  }
  get pendientes() {
    return this.items().filter((o) => !o.inicio);
  }
  elegirPorId(id: number | null) {
    this.idOrden = id;
  }
  elegir(o: any) {
    this.idOrden = o.id;
    this.form = {
      inicio: o.inicio?.slice(0, 16) || '',
      fin: o.fin?.slice(0, 16) || '',
      lugar: o.lugar || '',
      fechaEnvio: o.fechaEnvio || '',
      aprobadoCliente: !!o.aprobadoCliente,
      motivoCambio: '',
    };
  }
  archivo(e: Event, k: 'pt' | 'iper' | 'croquis') {
    this.archivos[k] = (e.target as HTMLInputElement).files?.item(0) || null;
  }
  descargar(o: any, k: string) {
    this.api.descargar('/ordenes-trabajo/' + o.id + '/documentos/' + k, k + '.pdf');
  }
  guardar() {
    if (
      !this.idOrden ||
      !this.form.fechaEnvio ||
      !this.form.aprobadoCliente ||
      !this.form.inicio ||
      !this.form.fin ||
      !this.form.lugar.trim()
    ) {
      this.error.set('Completa la documentación, aprobación del cliente y datos de programación.');
      return;
    }
    // Volvemos a comprobar las fechas al guardar. El atributo min del HTML
    // por sí solo no impide fechas inválidas escritas manualmente.
    const inicio = new Date(this.form.inicio).getTime();
    const fin = new Date(this.form.fin).getTime();
    if (!Number.isFinite(inicio) || !Number.isFinite(fin)) {
      this.error.set('Ingresa fechas y horas válidas para el inicio y el fin.');
      return;
    }
    if (inicio <= Date.now()) {
      this.actualizarLimitesFechas();
      this.error.set('La fecha y hora de inicio deben ser posteriores al momento actual.');
      return;
    }
    if (fin <= inicio) {
      this.error.set('La fecha y hora de fin deben ser posteriores a las de inicio.');
      return;
    }
    if (
      (!this.actual?.nombrePt && !this.archivos.pt) ||
      (!this.actual?.nombreIper && !this.archivos.iper)
    ) {
      this.error.set('Adjunta PT e IPER en PDF antes de programar.');
      return;
    }
    if (this.esEdicion && this.actual?.inicio && !this.form.motivoCambio.trim()) {
      this.error.set('Indica el motivo de la reprogramación.');
      return;
    }
    for (const k of ['pt', 'iper'] as const) {
      if (
        this.archivos[k] &&
        !(
          this.archivos[k]!.type === 'application/pdf' ||
          this.archivos[k]!.name.toLowerCase().endsWith('.pdf')
        )
      ) {
        this.error.set('PT e IPER deben ser PDF.');
        return;
      }
    }
    const fd = new FormData();
    for (const k of [
      'inicio',
      'fin',
      'lugar',
      'fechaEnvio',
      'aprobadoCliente',
      'motivoCambio',
    ] as const)
      fd.append(k, String(this.form[k]));
    for (const k of ['pt', 'iper', 'croquis'] as const) {
      if (this.archivos[k]) fd.append(k, this.archivos[k]!);
    }
    this.protegidoCargando(
      this.api.post('/ordenes-trabajo/' + this.idOrden + '/programacion', fd),
      'Servicio programado',
      '/programaciones',
    );
  }
}
