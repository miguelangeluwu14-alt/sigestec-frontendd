import { Routes } from '@angular/router';
import { PersonalCatalogo } from './pages/personal/personal';
import { rolesGuard } from '../../core/guards/roles-guard';
import { ROLES_PLAN } from '../../core/config/roles';
export const personalRoutes: Routes = [
  {
    path: 'personal',
    component: PersonalCatalogo,
    data: { roles: ROLES_PLAN },
    canActivate: [rolesGuard],
  },
];
