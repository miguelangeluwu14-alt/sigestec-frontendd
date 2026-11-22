import { Routes } from '@angular/router';
import { Solicitudes } from './pages/solicitudes/solicitudes';
import { ROLES_COMERCIAL } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const solicitudesRoutes: Routes = [
  pantalla('solicitudes', Solicitudes, ROLES_COMERCIAL, 'listado', 'Solicitudes de servicio'),
  pantalla(
    'solicitudes/nueva',
    Solicitudes,
    ROLES_COMERCIAL,
    'nuevo',
    'Nueva solicitud de servicio',
  ),
  pantalla('solicitudes/editar/:id', Solicitudes, ROLES_COMERCIAL, 'editar', 'Editar solicitud'),
  pantalla('solicitudes/ver/:id', Solicitudes, ROLES_COMERCIAL, 'detalle', 'Detalle de solicitud'),
];
