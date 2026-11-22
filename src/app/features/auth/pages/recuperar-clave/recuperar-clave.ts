import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './recuperar-clave.html',
  styleUrl: './recuperar-clave.css',
})
export class RecuperarClave {
  private readonly auth = inject(AuthService);
  username = '';
  enviando = signal(false);
  enviado = signal(false);
  error = signal('');

  enviar(): void {
    if (!this.username.trim()) {
      this.error.set('Ingresa tu nombre de usuario.');
      return;
    }
    this.error.set('');
    this.enviando.set(true);
    this.auth.solicitarRecuperacion(this.username.trim()).subscribe({
      next: () => { this.enviando.set(false); this.enviado.set(true); },
      error: (e) => {
        this.enviando.set(false);
        this.error.set(e.status === 503
          ? 'El servicio de correo todavía no está configurado. Consulta al administrador.'
          : e.status === 0
            ? 'No se puede conectar con el backend. Comprueba IntelliJ.'
            : 'No se pudo procesar la solicitud. Inténtalo más tarde.');
      },
    });
  }
}
