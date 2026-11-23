import { DetalleOperativo } from '../../shared/pages/detalle-operativo/detalle-operativo';
import { Routes } from '@angular/router';
import { AtsPage } from './pages/ats/ats';
import { AprobacionesAts } from './pages/aprobaciones-ats/aprobaciones-ats';
import { ROLES_PLAN, ROLES_ATS } from '../../core/config/roles';
import { pantalla } from '../../shared/utils/pantalla-route';
export const atsRoutes: Routes = [
  pantalla('ats/aprobaciones/ver/:id', DetalleOperativo, ROLES_PLAN, 'detalle', 'Detalle aprobación ATS'),

  pantalla('ats', AtsPage, ROLES_ATS, 'listado', 'Análisis de Trabajo Seguro'),
  pantalla('ats/nuevo', AtsPage, ROLES_ATS, 'nuevo', 'Registrar ATS'),
  pantalla('ats/editar/:id', AtsPage, ROLES_ATS, 'editar', 'Editar ATS'),
  pantalla('ats/ver/:id', AtsPage, ['SSOMA', 'SUPERVISOR'], 'detalle', 'Detalle del ATS'),
  pantalla('ats/aprobaciones', AprobacionesAts, ROLES_PLAN, 'listado', 'Aprobaciones ATS'),
  pantalla('ats/aprobaciones/nueva', AprobacionesAts, ROLES_PLAN, 'nuevo', 'Aprobar ATS'),
  pantalla('ats/aprobaciones/nueva/:id', AprobacionesAts, ROLES_PLAN, 'nuevo', 'Aprobar ATS'),
];
