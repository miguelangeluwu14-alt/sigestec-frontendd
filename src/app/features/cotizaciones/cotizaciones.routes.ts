import { Routes } from '@angular/router';
import { Cotizaciones } from './pages/cotizaciones/cotizaciones';
import { ROLES_COMERCIAL } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const cotizacionesRoutes: Routes = [
  pantalla('cotizaciones', Cotizaciones, ROLES_COMERCIAL, 'listado', 'Cotizaciones'),
  pantalla('cotizaciones/nueva', Cotizaciones, ROLES_COMERCIAL, 'nuevo', 'Nueva cotización'),
  pantalla('cotizaciones/editar/:id', Cotizaciones, ROLES_COMERCIAL, 'editar', 'Editar cotización'),
  pantalla(
    'cotizaciones/ver/:id',
    Cotizaciones,
    ROLES_COMERCIAL,
    'detalle',
    'Detalle de cotización',
  ),
];
