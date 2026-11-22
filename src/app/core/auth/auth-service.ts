import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import type { Sesion } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private read(): Sesion | null {
    try {
      const raw = sessionStorage.getItem('sigestec_sesion');
      const s = raw ? (JSON.parse(raw) as Sesion) : null;
      if (!s || s.expiraEn < Date.now()) {
        sessionStorage.removeItem('sigestec_sesion');
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }
  sesion = signal<Sesion | null>(this.read());
  login(username: string, password: string) {
    return this.http.post<{
      token: string;
      rol: string;
      nombre: string;
      username: string;
      expiraEnSegundos: number;
    }>(environment.apiUrl + '/auth/login', { username, password });
  }
  iniciar(x: {
    token: string;
    rol: string;
    nombre: string;
    username: string;
    expiraEnSegundos: number;
  }) {
    const s: Sesion = { ...x, expiraEn: Date.now() + x.expiraEnSegundos * 1000 };
    sessionStorage.setItem('sigestec_sesion', JSON.stringify(s));
    this.sesion.set(s);
    this.router.navigateByUrl('/inicio');
  }
  cambiarClave(claveActual: string, claveNueva: string) {
    return this.http.post<{ mensaje: string }>(environment.apiUrl + '/auth/cambiar-clave', {
      claveActual,
      claveNueva,
    });
  }

  solicitarRecuperacion(username: string) {
    return this.http.post<{ mensaje: string }>(environment.apiUrl + '/auth/recuperar-clave', {
      username,
    });
  }

  restablecerClave(token: string, claveNueva: string) {
    return this.http.post<{ mensaje: string }>(environment.apiUrl + '/auth/restablecer-clave', {
      token,
      claveNueva,
    });
  }

  salir(claveActualizada = false) {
    sessionStorage.removeItem('sigestec_sesion');
    this.sesion.set(null);
    this.router.navigateByUrl(claveActualizada ? '/login?claveActualizada=1' : '/login');
  }
  vigente() {
    const s = this.sesion();
    if (!s || s.expiraEn <= Date.now()) {
      this.salir();
      return false;
    }
    return true;
  }
  puede(roles: string[]) {
    const r = this.sesion()?.rol;
    return !!r && (r === 'ADMIN' || roles.includes(r));
  }
}
