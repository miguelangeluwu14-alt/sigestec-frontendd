import { Routes } from '@angular/router';
import { MaterialesAlmacen } from './pages/materiales-almacen/materiales-almacen';
import { HerramientasAlmacen } from './pages/herramientas-almacen/herramientas-almacen';
import { ROLES_ALMACEN } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const almacenRoutes: Routes = [
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
