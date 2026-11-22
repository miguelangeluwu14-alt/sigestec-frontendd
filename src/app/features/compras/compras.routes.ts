import { Routes } from '@angular/router';
import { Compras } from './pages/compras/compras';
import { ROLES_COMERCIAL } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const comprasRoutes: Routes = [
  pantalla('compras', Compras, ROLES_COMERCIAL, 'listado', 'Órdenes de compra'),
  pantalla('compras/nueva', Compras, ROLES_COMERCIAL, 'nuevo', 'Nueva orden de compra'),
  pantalla('compras/editar/:id', Compras, ROLES_COMERCIAL, 'editar', 'Editar orden de compra'),
  pantalla('compras/ver/:id', Compras, ROLES_COMERCIAL, 'detalle', 'Detalle de orden de compra'),
];
