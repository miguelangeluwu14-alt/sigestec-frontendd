import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-documento-adjunto',
  standalone: true,
  templateUrl: './documento-adjunto.html',
  styleUrl: './documento-adjunto.css',
})
export class DocumentoAdjunto implements OnChanges, OnDestroy {
  @Input() archivo: File | null = null;
  @Input() url: string | null = null;
  @Input() nombre = '';
  @Input() permitirQuitar = false;
  @Output() quitar = new EventEmitter<void>();

  private api = inject(ApiService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private objetoUrl: string | null = null;
  vista: SafeResourceUrl | null = null;
  vistaEsImagen = false;
  cargando = false;
  error = '';

  get imagenUrl(): string | null { return this.objetoUrl; }
  get disponible(): boolean { return !!this.archivo || !!this.url; }
  get titulo(): string { return this.archivo?.name || this.nombre || this.url?.split('/').pop()?.split(/[?#]/)[0] || 'Documento adjunto'; }

  ngOnChanges(): void { this.limpiar(); }
  ngOnDestroy(): void { this.limpiar(); }

  private limpiar() {
    if (this.objetoUrl) URL.revokeObjectURL(this.objetoUrl);
    this.objetoUrl = null;
    this.vista = null;
    this.vistaEsImagen = false;
    this.error = '';
  }

  private ruta(): string | null {
    const nombre = this.url?.split('/').pop()?.split(/[?#]/)[0] || '';
    return /^[A-Za-z0-9_.-]+\.(pdf|png|jpg|jpeg)$/i.test(nombre)
      ? '/archivos/' + nombre : null;
  }

  ver() {
    this.error = '';
    if (this.vista) { this.limpiar(); return; }
    if (this.archivo) { this.mostrar(this.archivo); return; }
    const ruta = this.ruta();
    if (!ruta) { this.error = 'No se reconoce la referencia del documento.'; return; }
    this.cargando = true;
    this.api.blob(ruta).subscribe({
      next: (b) => { this.cargando = false; this.mostrar(b); this.cdr.markForCheck(); },
      error: (e) => {
        this.cargando = false;
        this.error = this.mensajeArchivo(e);
        this.cdr.markForCheck();
      },
    });
  }

  abrir() {
    if (this.archivo) {
      const temporal = URL.createObjectURL(this.archivo);
      window.open(temporal, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(temporal), 60000);
    } else {
      const ruta = this.ruta();
      if (ruta) this.api.abrirArchivo(ruta);
      else this.error = 'No se reconoce la referencia del documento.';
    }
  }

  private mensajeArchivo(e: any): string {
    if (e?.status === 404) {
      return 'Archivo no encontrado (HTTP 404). Si es un adjunto anterior a Google Drive, comprueba que exista en la carpeta local original «archivos-sigestec». Si está en Drive, verifica que no se haya eliminado y que la cuenta autorizada tenga acceso.';
    }
    if (e?.status === 403) return 'Acceso denegado al documento (HTTP 403). Comprueba los permisos del usuario.';
    if (e?.status === 502 || e?.status === 503) return 'No se pudo acceder al almacenamiento de archivos. Revisa la conexión de Spring Boot con Google Drive.';
    return this.api.mensaje(e);
  }

  private mostrar(blob: Blob) {
    // Algunos servicios entregan archivos como octet-stream: recuperar el tipo por la extensión.
    const nombre = (this.archivo?.name || this.url || '').split(/[?#]/)[0].toLowerCase();
    const tipo = blob.type === 'application/octet-stream' || !blob.type
      ? nombre.endsWith('.pdf') ? 'application/pdf' : nombre.endsWith('.png') ? 'image/png' : /\.jpe?g$/.test(nombre) ? 'image/jpeg' : blob.type
      : blob.type;
    if (tipo && !['application/pdf', 'image/png', 'image/jpeg'].includes(tipo)) {
      this.error = 'Este tipo de archivo no admite vista previa.';
      return;
    }
    this.limpiar();
    const renderizable = tipo === blob.type ? blob : new Blob([blob], { type: tipo || 'application/octet-stream' });
    this.objetoUrl = URL.createObjectURL(renderizable);
    this.vistaEsImagen = tipo === 'image/png' || tipo === 'image/jpeg';
    this.vista = this.sanitizer.bypassSecurityTrustResourceUrl(this.objetoUrl);
  }
}
