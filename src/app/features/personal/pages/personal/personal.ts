import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { REGISTROS_POR_PAGINA } from '../../../../shared/pages/pagina-base';
import { AccionesSeguras } from '../../../../shared/components/acciones-seguras/acciones-seguras';

type PersonaDni = {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
};

type FormularioPersonal = {
  dni: string;
  nombres: string;
  apellidos: string;
  perfil: string;
};

function formularioVacio(): FormularioPersonal {
  return { dni: '', nombres: '', apellidos: '', perfil: 'TECNICO' };
}

@Component({
  standalone: true,
  imports: [FormsModule, AccionesSeguras],
  templateUrl: './personal.html',
  styleUrl: './personal.css',
})
export class PersonalCatalogo implements OnInit {
  api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  items: any[] = [];
  pagina = 1;
  readonly tamanoPagina = REGISTROS_POR_PAGINA;

  get numeroPaginas(): number {
    return Math.max(1, Math.ceil(this.items.length / this.tamanoPagina));
  }
  get paginas(): number[] {
    return Array.from({ length: this.numeroPaginas }, (_, i) => i + 1);
  }
  get paginados(): any[] {
    const paginaActual = Math.min(this.pagina, this.numeroPaginas);
    return this.items.slice((paginaActual - 1) * this.tamanoPagina, paginaActual * this.tamanoPagina);
  }
  irPagina(numero: number) {
    this.pagina = Math.min(this.numeroPaginas, Math.max(1, numero));
  }
  form: FormularioPersonal = formularioVacio();
  error = '';
  ok = '';
  errorConsulta = '';
  avisoConsulta = '';
  consultandoDni = false;
  guardando = false;
  dniConsultado = '';

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.api.get<any[]>('/personal').subscribe({
      next: (r) => { this.items = r; this.pagina = Math.min(this.pagina, this.numeroPaginas); this.cdr.markForCheck(); },
      error: (e) => { this.error = this.api.mensaje(e); this.cdr.markForCheck(); },
    });
  }

  alCambiarDni() {
    if (this.dniConsultado && this.form.dni !== this.dniConsultado) {
      this.form.nombres = '';
      this.form.apellidos = '';
      this.dniConsultado = '';
    }
    this.errorConsulta = '';
    this.avisoConsulta = '';
  }

  consultarDni() {
    if (this.consultandoDni || this.guardando) return;
    this.error = '';
    this.ok = '';
    this.errorConsulta = '';
    this.avisoConsulta = '';
    const dni = this.form.dni.trim();
    if (!/^\d{8}$/.test(dni)) {
      this.errorConsulta = 'Ingresa los 8 dígitos del DNI antes de consultar.';
      return;
    }
    this.consultandoDni = true;
    this.api.get<PersonaDni>('/consultas/dni/' + dni).subscribe({
      next: (persona) => {
        this.consultandoDni = false;
        this.cdr.markForCheck();
        if (this.form.dni.trim() !== dni) return;
        this.form.nombres = persona.nombres;
        this.form.apellidos = [persona.apellidoPaterno, persona.apellidoMaterno].filter(Boolean).join(' ');
        this.dniConsultado = dni;
        this.avisoConsulta = 'Datos encontrados. Revisa los nombres y apellidos antes de registrar.';
      },
      error: (e) => {
        this.consultandoDni = false;
        this.errorConsulta = this.api.mensaje(e);
        this.cdr.markForCheck();
      },
    });
  }

  guardar() {
    if (this.guardando) return;
    this.error = '';
    this.ok = '';
    const dni = this.form.dni.trim();
    const nombres = this.form.nombres.trim();
    const apellidos = this.form.apellidos.trim();
    if (dni && !/^\d{8}$/.test(dni)) {
      this.error = 'El DNI debe tener 8 dígitos.';
      return;
    }
    if (!nombres || !apellidos) {
      this.error = 'Completa los nombres y apellidos del colaborador.';
      return;
    }
    this.guardando = true;
    this.api.post('/personal', {
      dni,
      nombres,
      apellidos,
      nombre: `${nombres} ${apellidos}`,
      perfil: this.form.perfil,
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.cdr.markForCheck();
        this.ok = 'Personal registrado correctamente en Oracle.';
        this.form = formularioVacio();
        this.dniConsultado = '';
        this.errorConsulta = '';
        this.avisoConsulta = '';
        this.cargar();
      },
      error: (e) => {
        this.guardando = false;
        this.cdr.markForCheck();
        this.error = this.api.mensaje(e);
      },
    });
  }
}
