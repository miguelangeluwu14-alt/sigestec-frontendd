import { Routes } from '@angular/router';
import { Catalogos } from './pages/catalogos/catalogos';
import { rolesGuard } from '../../core/guards/roles-guard';
import { ROLES_COMERCIAL } from '../../core/config/roles';
export const catalogosRoutes: Routes = [
  {
    path: 'clientes',
    component: Catalogos,
    data: { tipo: 'clientes', roles: ROLES_COMERCIAL },
    canActivate: [rolesGuard],
  },
  {
    path: 'tipos-servicio',
    component: Catalogos,
    data: { tipo: 'tipos-servicio', roles: ROLES_COMERCIAL },
    canActivate: [rolesGuard],
  },
];
