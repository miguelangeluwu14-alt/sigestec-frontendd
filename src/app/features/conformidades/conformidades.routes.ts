import { Routes } from '@angular/router';
import { Conformidades } from './pages/conformidades/conformidades';
import { ROLES_PLAN } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const conformidadesRoutes: Routes = [
  pantalla('conformidades', Conformidades, ROLES_PLAN, 'listado', 'Conformidad del servicio'),
  pantalla('conformidades/nueva', Conformidades, ROLES_PLAN, 'nuevo', 'Registrar conformidad'),
  pantalla('conformidades/ver/:id', Conformidades, ROLES_PLAN, 'detalle', 'Detalle conformidad'),
];
