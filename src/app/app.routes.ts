import { Routes } from '@angular/router';
import { EditorRegistro } from './shared/pages/editor-registro/editor-registro';
import { Layout } from './layout/main-layout/layout';
import { authGuard } from './core/guards/auth-guard';
import { authRoutes } from './features/auth/auth.routes';
import { inicioRoutes } from './features/inicio/inicio.routes';
import { Inicio } from './features/inicio/pages/inicio/inicio';
import { CambiarClave } from './features/auth/pages/cambiar-clave/cambiar-clave';
import { catalogosRoutes } from './features/catalogos/catalogos.routes';
import { personalRoutes } from './features/personal/personal.routes';
import { solicitudesRoutes } from './features/solicitudes/solicitudes.routes';
import { cotizacionesRoutes } from './features/cotizaciones/cotizaciones.routes';
import { comprasRoutes } from './features/compras/compras.routes';
import { asignacionesRoutes } from './features/asignaciones/asignaciones.routes';
import { programacionesRoutes } from './features/programaciones/programaciones.routes';
import { atsRoutes } from './features/ats/ats.routes';
import { ejecucionesRoutes } from './features/ejecuciones/ejecuciones.routes';
import { informesRoutes } from './features/informes/informes.routes';
import { conformidadesRoutes } from './features/conformidades/conformidades.routes';
import { almacenRoutes } from './features/almacen/almacen.routes';

export const routes: Routes = [
  ...authRoutes,
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      ...inicioRoutes,
      { path: 'mi-cuenta/cambiar-clave', component: CambiarClave, title: 'Cambiar contraseña | SIGESTEC' },
      ...catalogosRoutes,
      ...personalRoutes,
      ...solicitudesRoutes,
      ...cotizacionesRoutes,
      ...comprasRoutes,
      ...asignacionesRoutes,
      ...programacionesRoutes,
      ...atsRoutes,
      ...ejecucionesRoutes,
      ...informesRoutes,
      ...conformidadesRoutes,
      ...almacenRoutes,
      { path:'gestion/editar/:recurso/:id', component:EditorRegistro, title:'Editar registro | SIGESTEC' },
      { path: 'acceso-denegado', component: Inicio, data: { denegado: true } },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
