import { DetalleOperativo } from '../../shared/pages/detalle-operativo/detalle-operativo';
import { Routes } from '@angular/router';
import { MaterialesAlmacen } from './pages/materiales-almacen/materiales-almacen';
import { HerramientasAlmacen } from './pages/herramientas-almacen/herramientas-almacen';
import { ROLES_ALMACEN } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const almacenRoutes: Routes = [
  pantalla('almacen/materiales/ver/:id', DetalleOperativo, ROLES_ALMACEN, 'detalle', 'Detalle material'),
  pantalla('almacen/materiales/movimientos/ver/:id', DetalleOperativo, ROLES_ALMACEN, 'detalle', 'Detalle movimiento material'),
  pantalla('almacen/herramientas/ver/:id', DetalleOperativo, ROLES_ALMACEN, 'detalle', 'Detalle herramienta'),
  pantalla('almacen/herramientas/movimientos/ver/:id', DetalleOperativo, ROLES_ALMACEN, 'detalle', 'Detalle movimiento herramienta'),

  pantalla('almacen/materiales', MaterialesAlmacen, ROLES_ALMACEN, 'listado', 'Almacén materiales'),
  pantalla(
    'almacen/materiales/nuevo',
    MaterialesAlmacen,
    ROLES_ALMACEN,
    'nuevo-material',
    'Nuevo material',
  ),
  pantalla(
    'almacen/materiales/movimiento',
    MaterialesAlmacen,
    ROLES_ALMACEN,
    'nuevo-movimiento',
    'Movimiento de material',
  ),
  pantalla(
    'almacen/herramientas',
    HerramientasAlmacen,
    ROLES_ALMACEN,
    'listado',
    'Almacén herramientas',
  ),
  pantalla(
    'almacen/herramientas/nueva',
    HerramientasAlmacen,
    ROLES_ALMACEN,
    'nueva-herramienta',
    'Nueva herramienta',
  ),
  pantalla(
    'almacen/herramientas/movimiento',
    HerramientasAlmacen,
    ROLES_ALMACEN,
    'nuevo-movimiento',
    'Movimiento de herramienta',
  ),
];
