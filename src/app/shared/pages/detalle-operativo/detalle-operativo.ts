import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginaBase } from '../pagina-base';
import { DocumentoAdjunto } from '../../components/documento-adjunto/documento-adjunto';

type Tipo = 'material' | 'movimiento-material' | 'herramienta' | 'movimiento-herramienta' | 'aprobacion';
type Campo = { etiqueta: string; valor: string; largo?: boolean };

@Component({
  standalone: true,
  imports: [RouterLink, DocumentoAdjunto],
  templateUrl: './detalle-operativo.html',
  styleUrl: './detalle-operativo.css',
})
export class DetalleOperativo extends PaginaBase implements OnInit {
  datos = signal<any | null>(null);
  cargando = signal(true);
  get tipo(): Tipo {
    const ruta = this.route.snapshot.routeConfig?.path || '';
    if (ruta.startsWith('ats/aprobaciones')) return 'aprobacion';
    if (ruta.includes('materiales/movimientos')) return 'movimiento-material';
    if (ruta.includes('materiales')) return 'material';
    if (ruta.includes('herramientas/movimientos')) return 'movimiento-herramienta';
    return 'herramienta';
  }
  get volver(): string {
    return this.tipo === 'aprobacion' ? '/ats/aprobaciones'
      : this.tipo === 'material' || this.tipo === 'movimiento-material' ? '/almacen/materiales'
      : '/almacen/herramientas';
  }
  get titulo(): string {
    const nombres: Record<Tipo, string> = {
      material: 'Detalle del material',
      'movimiento-material': 'Detalle del movimiento de material',
      herramienta: 'Detalle de la herramienta',
      'movimiento-herramienta': 'Detalle del movimiento de herramienta',
      aprobacion: 'Detalle de la aprobación del ATS',
    };
    return nombres[this.tipo];
  }
  ngOnInit(): void {
    const rutas: Record<Tipo, string> = {
      material: '/almacen/materiales',
      'movimiento-material': '/almacen/movimientos',
      herramienta: '/almacen/herramientas',
      'movimiento-herramienta': '/almacen/herramientas/movimientos',
      aprobacion: '/ats/aprobaciones',
    };
    this.api.get<any[]>(rutas[this.tipo]).subscribe({
      next: registros => {
        this.datos.set(registros.find(r => r.id === this.id) || null);
        this.cargando.set(false);
      },
      error: e => {
        this.error.set(this.api.mensaje(e));
        this.cargando.set(false);
      },
    });
  }
  private ver(valor: unknown): string {
    return valor === null || valor === undefined || valor === '' ? '—' : String(valor);
  }
  get campos(): Campo[] {
    const d = this.datos();
    if (!d) return [];
    const campo = (etiqueta: string, valor: unknown, largo = false): Campo => ({etiqueta, valor: this.ver(valor), largo});
    switch (this.tipo) {
      case 'material': return [
        campo('Código', d.codigo), campo('Nombre', d.nombre), campo('Unidad de medida', d.unidadMedida),
        campo('Stock actual', d.stockActual), campo('Stock mínimo', d.stockMinimo),
        campo('Alerta', d.bajoMinimo ? 'Bajo o al mínimo' : 'Disponible'),
        campo('Estado', d.estado === 'A' ? 'Activo' : 'Inactivo'),
      ];
      case 'movimiento-material': return [
        campo('Material', d.material?.nombre), campo('Código del material', d.material?.codigo),
        campo('Movimiento', d.tipoMovimiento), campo('Cantidad', d.cantidad),
        campo('Fecha', d.fechaMovimiento?.replace('T', ' ')),
        campo('Orden de trabajo', d.ordenTrabajoNumero || '—'),
        campo('Registrado por', d.empleadoRegistra?.nombre),
        campo('Motivo', d.motivo, true), campo('Observaciones', d.observacion, true),
      ];
      case 'herramienta': return [
        campo('Código', d.codigo), campo('Nombre', d.nombre),
        campo('Cantidad total', d.cantidadTotal), campo('Cantidad disponible', d.cantidadDisponible),
        campo('Estado', d.estado === 'A' ? 'Activo' : 'Inactivo'), campo('Descripción', d.descripcion, true),
      ];
      case 'movimiento-herramienta': return [
        campo('Herramienta', d.herramienta?.nombre), campo('Código', d.herramienta?.codigo),
        campo('Tipo de movimiento', d.tipoMovimiento), campo('Cantidad', d.cantidad),
        campo('Fecha', d.fechaMovimiento?.replace('T', ' ')),
        campo('Orden de trabajo', d.ordenTrabajoNumero || '—'),
        campo('Técnico responsable', d.empleadoResponsable?.nombre),
        campo('Registrado por', d.empleadoRegistra?.nombre),
        campo('Estado de devolución', d.estadoDevolucion), campo('Observaciones', d.observacion, true),
      ];
      case 'aprobacion': return [
        campo('N.º ATS', d.atsNumero || ''),
        campo('Orden de trabajo', d.ordenTrabajoNumero || ''),
        campo('Supervisor del cliente', d.supervisorCliente),
        campo('SSOMA del cliente', d.ssomaCliente),
        campo('Fecha de revisión', d.fechaRevision),
        campo('Resultado', d.resultado),
        campo('Registrado por', d.empleadoRegistra?.nombre),
        campo('Observaciones', d.observaciones, true),
      ];
    }
  }
  get aviso(): string {
    return this.tipo === 'aprobacion'
      ? 'La aprobación y sus documentos son evidencia histórica. Esta consulta es de solo lectura.'
      : this.tipo.startsWith('movimiento')
        ? 'Los movimientos se conservan en el historial y se rectifican mediante movimientos compensatorios.'
        : 'Consulta del catálogo y sus existencias actuales.';
  }
}
