import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { ApiService } from '../../../../core/services/api.service';
import { timeout } from 'rxjs';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  auth = inject(AuthService);
  claveActualizada = inject(ActivatedRoute).snapshot.queryParamMap.get('claveActualizada') === '1';
  api = inject(ApiService);
  username = '';
  password = '';
  mostrar = false;
  cargando = signal(false);
  error = signal('');
  entrar() {
    if (!this.username.trim() || !this.password) {
      this.error.set('Ingresa tu usuario y contraseña.');
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.auth
      .login(this.username.trim(), this.password)
      .pipe(timeout(15000))
      .subscribe({
        next: (r) => {
          this.cargando.set(false);
          this.auth.iniciar(r);
        },
        error: (e) => {
          this.cargando.set(false);
          this.error.set(
            e.status === 401 || e.status === 403
              ? 'Usuario o contraseña incorrectos.'
              : e.name === 'TimeoutError'
                ? 'El servidor no respondió. Comprueba el backend en el puerto 8080.'
                : e.status === 0
                  ? 'No se puede conectar con el backend en localhost:8080.'
                  : this.api.mensaje(e),
          );
        },
      });
  }
}
