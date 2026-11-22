import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth-service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cambiar-clave.html',
  styleUrl: './cambiar-clave.css',
})
export class CambiarClave {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  actual = '';
  nueva = '';
  confirmar = '';
  mostrar = false;
  guardando = signal(false);
  error = signal('');

  guardar(): void {
    this.error.set('');
    if (!this.actual || !this.nueva || !this.confirmar) {
      this.error.set('Completa todos los campos.');
      return;
    }
    if (this.nueva.length < 8 || new TextEncoder().encode(this.nueva).length > 72) {
      this.error.set('La nueva contraseña debe contener entre 8 y 72 bytes.');
      return;
    }
    if (this.nueva !== this.confirmar) {
      this.error.set('La confirmación no coincide con la nueva contraseña.');
      return;
    }
    if (this.actual === this.nueva) {
      this.error.set('Utiliza una contraseña diferente de la actual.');
      return;
    }
    this.guardando.set(true);
    this.auth.cambiarClave(this.actual, this.nueva).subscribe({
      next: () => {
        this.guardando.set(false);
        this.actual = '';
        this.nueva = '';
        this.confirmar = '';
        this.auth.salir(true);
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(e.status === 400
          ? 'La contraseña actual es incorrecta o la nueva contraseña no es válida.'
          : this.api.mensaje(e));
      },
    });
  }
}
