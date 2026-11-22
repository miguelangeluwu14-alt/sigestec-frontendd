import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, interval, startWith } from 'rxjs';
import { AuthService } from '../../core/auth/auth-service';
type Seccion = 'comercial' | 'planificacion' | 'ats' | 'ejecucion' | 'almacen' | 'parametros';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  auth = inject(AuthService);
  router = inject(Router);
  segundosRestantes = signal(0);
  tiempoRestante = computed(() => {
    const segundos = this.segundosRestantes();
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const resto = segundos % 60;
    const dosDigitos = (n: number) => String(n).padStart(2, '0');
    return horas > 0
      ? `${dosDigitos(horas)}:${dosDigitos(minutos)}:${dosDigitos(resto)}`
      : `${dosDigitos(minutos)}:${dosDigitos(resto)}`;
  });
  menuVisible = false;
  menuReducido = false;
  comercial = false;
  planificacion = false;
  ats = false;
  ejecucion = true;
  almacen = false;
  parametros = false;
  constructor() {


    interval(1000)
      .pipe(startWith(0), takeUntilDestroyed())
      .subscribe(() => {
        const sesion = this.auth.sesion();
        const restante = Math.max(0, Math.ceil(((sesion?.expiraEn ?? 0) - Date.now()) / 1000));
        this.segundosRestantes.set(restante);
        if (sesion && restante === 0) this.auth.salir();
      });
    this.sincronizarModulo(this.router.url);
    this.router.events
      .pipe(
        filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((evento) => this.sincronizarModulo(evento.urlAfterRedirects));
  }
  iniciales(): string {
    const nombre = this.auth.sesion()?.nombre?.trim() || this.auth.sesion()?.username || 'Usuario';
    return nombre
      .split(/\s+/)
      .slice(0, 2)
      .map((palabra) => palabra[0])
      .join('')
      .toUpperCase();
  }
  cerrarMenuMovil(): void {
    this.menuVisible = false;
  }
  alternarMenu(): void {
    if (this.menuVisible) {
      this.cerrarMenuMovil();
    } else {
      this.menuReducido = !this.menuReducido;
    }
  }
  modulo(nombre: Seccion): void {
    const abrir = !this[nombre];
    this.cerrarSecciones();
    this[nombre] = abrir;
  }
  private cerrarSecciones(): void {
    this.comercial = false;
    this.planificacion = false;
    this.ats = false;
    this.ejecucion = false;
    this.almacen = false;
    this.parametros = false;
  }
  private sincronizarModulo(url: string): void {
    const nombre: Seccion | null = /^\/(solicitudes|cotizaciones|compras)(\/|$)/.test(url)
      ? 'comercial'
      : /^\/(asignaciones|programaciones)(\/|$)/.test(url)
        ? 'planificacion'
        : /^\/ats(\/|$)/.test(url)
          ? 'ats'
          : /^\/(ejecuciones|informes|conformidades)(\/|$)/.test(url)
            ? 'ejecucion'
            : /^\/almacen(\/|$)/.test(url)
              ? 'almacen'
              : /^\/(clientes|tipos-servicio|personal)(\/|$)/.test(url)
                ? 'parametros'
                : null;
    if (nombre) {
      this.cerrarSecciones();
      this[nombre] = true;
    }
  }
}
