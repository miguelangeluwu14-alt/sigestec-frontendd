import { Routes } from '@angular/router';
import { Ejecuciones } from './pages/ejecuciones/ejecuciones';
import { ROLES_PLAN } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const ejecucionesRoutes: Routes = [
  pantalla('ejecuciones', Ejecuciones, ROLES_PLAN, 'listado', 'Ejecuciones de servicio'),
  pantalla('ejecuciones/nueva', Ejecuciones, ROLES_PLAN, 'nuevo', 'Nueva ejecución'),
  pantalla('ejecuciones/editar/:id', Ejecuciones, ROLES_PLAN, 'editar', 'Editar ejecución'),
  pantalla('ejecuciones/ver/:id', Ejecuciones, ROLES_PLAN, 'detalle', 'Detalle ejecución'),
];
