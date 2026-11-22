import { Routes } from '@angular/router';
import { Asignaciones } from './pages/asignaciones/asignaciones';
import { ROLES_PLAN } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const asignacionesRoutes: Routes = [
  pantalla('asignaciones', Asignaciones, ROLES_PLAN, 'listado', 'Asignaciones de personal'),
  pantalla('asignaciones/nueva', Asignaciones, ROLES_PLAN, 'nuevo', 'Nueva asignación'),
  pantalla('asignaciones/editar/:id', Asignaciones, ROLES_PLAN, 'editar', 'Cambiar equipo'),
  pantalla('asignaciones/ver/:id', Asignaciones, ROLES_PLAN, 'detalle', 'Detalle de asignación'),
];
