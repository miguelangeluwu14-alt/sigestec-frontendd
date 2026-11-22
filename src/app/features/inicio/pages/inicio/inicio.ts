import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { MODULOS_INICIO } from '../../../../core/config/menu';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  auth = inject(AuthService);
  ruta = inject(ActivatedRoute);
  modulos = MODULOS_INICIO;
}
