import { Routes } from '@angular/router';
import { Informes } from './pages/informes/informes';
import { ROLES_PLAN } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const informesRoutes: Routes = [
  pantalla('informes', Informes, ROLES_PLAN, 'listado', 'Informes técnicos'),
  pantalla('informes/nuevo', Informes, ROLES_PLAN, 'nuevo', 'Nuevo informe técnico'),
  pantalla('informes/editar/:id', Informes, ROLES_PLAN, 'editar', 'Editar informe técnico'),
  pantalla('informes/ver/:id', Informes, ROLES_PLAN, 'detalle', 'Detalle informe técnico'),
];
