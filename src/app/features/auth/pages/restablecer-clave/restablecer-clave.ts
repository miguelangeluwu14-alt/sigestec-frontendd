import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './restablecer-clave.html',
  styleUrl: './restablecer-clave.css',
})
export class RestablecerClave {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private token = this.route.snapshot.queryParamMap.get('token') ?? '';
  nueva = '';
  confirmar = '';
  mostrar = false;
  guardando = signal(false);
  completado = signal(false);
  error = signal('');

  ngOnInit(): void {
    if (this.token) {
      void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    }
  }

  get tieneToken(): boolean { return !!this.token; }

  guardar(): void {
    if (!this.token) { this.error.set('Enlace inválido. Solicita uno nuevo.'); return; }
    if (this.nueva.length < 8 || new TextEncoder().encode(this.nueva).length > 72) {
      this.error.set('La contraseña debe tener entre 8 y 72 bytes.'); return;
    }
    if (this.nueva !== this.confirmar) { this.error.set('Las contraseñas no coinciden.'); return; }
    this.error.set('');
    this.guardando.set(true);
    this.auth.restablecerClave(this.token, this.nueva).subscribe({
      next: () => {
        this.guardando.set(false);
        this.completado.set(true);
        this.token = '';
        this.nueva = '';
        this.confirmar = '';

        sessionStorage.removeItem('sigestec_sesion');
        this.auth.sesion.set(null);
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(e.status === 400
          ? 'El enlace no es válido, ya se utilizó o caducó. Solicita uno nuevo.'
          : e.status === 0 ? 'No se puede conectar con el backend.'
            : 'No se pudo restablecer la contraseña. Inténtalo nuevamente.');
      },
    });
  }
}
