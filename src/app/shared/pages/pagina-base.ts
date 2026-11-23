import { inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

export const REGISTROS_POR_PAGINA = 10;

export abstract class PaginaBase {
  readonly api = inject(ApiService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly items = signal<any[]>([]);
  readonly error = signal('');
  readonly ok = signal('');
  readonly guardando = signal(false);
  buscar = '';
  filtro = 'Todos';
  pagina = 1;
  readonly tamanoPagina = REGISTROS_POR_PAGINA;
  get vista(): string {
    return this.route.snapshot.data['vista'] || 'listado';
  }
  get id(): number {
    return Number(this.route.snapshot.paramMap.get('id') || 0);
  }
  get registro(): any | undefined {
    return this.items().find((i) => i.id === this.id);
  }
  get enListado() {
    return this.vista === 'listado';
  }
  get esDetalle() {
    return this.vista === 'detalle';
  }
  get esEdicion() {
    return this.vista === 'editar';
  }
  get filtrados(): any[] {
    return this.items().filter((x) => {
      const texto = this.textoBusqueda(x).toLocaleLowerCase('es');
      return (
        texto.includes(this.buscar.trim().toLocaleLowerCase('es')) &&
        (this.filtro === 'Todos' || this.estadoDe(x) === this.filtro)
      );
    });
  }
  get paginados(): any[] {
    return this.filtrados.slice(
      (this.pagina - 1) * this.tamanoPagina,
      this.pagina * this.tamanoPagina,
    );
  }
  get numeroPaginas(): number {
    return Math.max(1, Math.ceil(this.filtrados.length / this.tamanoPagina));
  }
  get paginas(): number[] {
    return Array.from({ length: this.numeroPaginas }, (_, i) => i + 1);
  }
  get estados(): string[] {
    return [
      ...new Set(
        this.items()
          .map((x) => this.estadoDe(x))
          .filter(Boolean),
      ),
    ].sort();
  }
  irPagina(n: number) {
    this.pagina = Math.min(this.numeroPaginas, Math.max(1, n));
  }
  buscarAhora() {
    this.pagina = 1;
  }
  protected textoBusqueda(x: any): string {
    return JSON.stringify(x);
  }
  protected estadoDe(x: any): string {
    return x.estado || '';
  }
  claseEstado(estado: string): string {
    switch ((estado || '').toUpperCase()) {
      case 'PENDIENTE':
      case 'EMITIDA':
      case 'ELABORADO':
        return 'estado-pendiente';
      case 'ACEPTADA':
      case 'ATENDIDA':
      case 'APROBADA':
      case 'APROBADO':
      case 'CONFORME':
      case 'ENVIADO':
        return 'estado-exito';
      case 'RECHAZADA':
      case 'RECHAZADO':
      case 'CANCELADA':
      case 'OBSERVADA':
        return 'estado-error';
      case 'ASIGNADA':
      case 'PROGRAMADA':
      case 'EJECUTADA':
      case 'REGISTRADA':
        return 'estado-info';
      default:
        return 'estado-neutral';
    }
  }
  protegidoCargando(llamada: any, _mensaje: string, ruta: string) {
    this.error.set('');
    this.ok.set('');
    this.guardando.set(true);
    llamada.subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigateByUrl(ruta);
      },
      error: (e: any) => {
        this.error.set(this.api.mensaje(e));
        this.guardando.set(false);
      },
    });
  }
  protected guardarCorreccionConArchivo(
    modulo: string, id: number, datos: Record<string, unknown>, pdf: File | null,
    quitar: boolean, ruta: string,
  ) {
    const endpoint = `/gestion/${modulo}/${id}`;
    const conArchivo = !!pdf || quitar;
    if (!conArchivo) {
      this.protegidoCargando(this.api.put(endpoint, datos), 'Cambios guardados', ruta);
      return;
    }
    const fd = new FormData();
    fd.append('datos', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
    if (pdf) fd.append('pdf', pdf);
    fd.append('quitar', String(quitar));
    this.protegidoCargando(this.api.put(endpoint + '/documento', fd), 'Cambios guardados', ruta);
  }
  actualizarListado(url: string) {
    this.cargarItems(url);
  }
  protected cargarItems(url: string) {
    this.api.get<any[]>(url).subscribe({
      next: (r) => {
        this.items.set(r);
        this.pagina = Math.min(this.pagina, this.numeroPaginas);
      },
      error: (e) => this.error.set(this.api.mensaje(e)),
    });
  }
}
