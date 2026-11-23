import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { REGISTROS_POR_PAGINA } from '../../../../shared/pages/pagina-base';
type EmpresaConsultada = { ruc: string; razonSocial: string; estado: string; condicion: string; direccion: string };
import { AccionesSeguras } from '../../../../shared/components/acciones-seguras/acciones-seguras';

@Component({
  standalone: true,
  imports: [FormsModule, AccionesSeguras],
  templateUrl: './catalogos.html',
  styleUrl: './catalogos.css',
})
export class Catalogos implements OnInit {
  api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  route = inject(ActivatedRoute);
  get esClientes() {
    return this.route.snapshot.data['tipo'] === 'clientes';
  }
  get ruta() {
    return this.esClientes ? '/clientes' : '/tipos-servicio';
  }
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
  buscarEmpresa = '';
  consultando = false;
  empresasConsultadas: EmpresaConsultada[] = [];
  mensajeConsulta = '';
  errorConsulta = '';

  consultarEmpresa() {
    this.errorConsulta = '';
    this.mensajeConsulta = '';
    this.empresasConsultadas = [];
    const texto = this.buscarEmpresa.trim();
    if (!texto || (texto.length < 3 && !/^\d{11}$/.test(texto))) {
      this.errorConsulta = 'Escribe un RUC de 11 dígitos o al menos 3 letras de la razón social.';
      return;
    }
    this.consultando = true;
    this.api.get<EmpresaConsultada[]>('/consultas/empresas?buscar=' + encodeURIComponent(texto)).subscribe({
      next: (datos) => {
        this.consultando = false;
        this.empresasConsultadas = datos;
        this.cdr.markForCheck();
        this.mensajeConsulta = datos.length ? 'Selecciona la empresa correcta para completar el formulario.' : 'No se encontraron coincidencias.';
      },
      error: (e) => { this.consultando = false; this.errorConsulta = this.api.mensaje(e); this.cdr.markForCheck(); },
    });
  }

  seleccionarEmpresa(empresa: EmpresaConsultada) {
    this.form.ruc = empresa.ruc;
    this.form.razonSocial = empresa.razonSocial;
    this.empresasConsultadas = [];
    this.mensajeConsulta = 'Datos cargados. Verifica la empresa antes de guardar.';
  }

  form: any = {};
  error = '';
  ok = '';
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.api
      .get<any[]>(this.ruta)
      .subscribe({
        next: (x) => { this.items = x; this.pagina = Math.min(this.pagina, this.numeroPaginas); this.cdr.markForCheck(); },
        error: (e) => { this.error = this.api.mensaje(e); this.cdr.markForCheck(); },
      });
  }
  guardar() {
    this.error = '';
    this.ok = '';
    this.api.post(this.ruta, this.form).subscribe({
      next: () => {
        this.ok = 'Registro guardado';
        this.cdr.markForCheck();
        this.form = {};
        this.cargar();
      },
      error: (e) => { this.error = this.api.mensaje(e); this.cdr.markForCheck(); },
    });
  }
}
