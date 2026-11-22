import { Routes } from '@angular/router';
import { Programaciones } from './pages/programaciones/programaciones';
import { ROLES_PLAN } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const programacionesRoutes: Routes = [
  pantalla('programaciones', Programaciones, ROLES_PLAN, 'listado', 'Programaciones de servicio'),
  pantalla('programaciones/nueva', Programaciones, ROLES_PLAN, 'nuevo', 'Programar servicio'),
  pantalla(
    'programaciones/editar/:id',
    Programaciones,
    ROLES_PLAN,
    'editar',
    'Reprogramar servicio',
  ),
  pantalla(
    'programaciones/ver/:id',
    Programaciones,
    ROLES_PLAN,
    'detalle',
    'Detalle de programación',
  ),
];
