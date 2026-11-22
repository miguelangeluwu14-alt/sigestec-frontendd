import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { RecuperarClave } from './pages/recuperar-clave/recuperar-clave';
import { RestablecerClave } from './pages/restablecer-clave/restablecer-clave';
export const authRoutes: Routes = [
  { path: 'login', component: Login, title: 'Iniciar sesión | ACOIEL SAC' },
  { path: 'recuperar-clave', component: RecuperarClave, title: 'Recuperar contraseña | SIGESTEC' },
  { path: 'restablecer-clave', component: RestablecerClave, title: 'Restablecer contraseña | SIGESTEC' },
];
