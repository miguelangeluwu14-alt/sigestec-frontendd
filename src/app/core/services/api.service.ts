import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;
  get<T = any[]>(ruta: string) {
    return this.http.get<T>(this.url + ruta);
  }
  post<T = any>(ruta: string, body: unknown) {
    return this.http.post<T>(this.url + ruta, body);
  }
  put<T = any>(ruta: string, body: unknown) {
    return this.http.put<T>(this.url + ruta, body);
  }
  delete<T = any>(ruta: string) {
    return this.http.delete<T>(this.url + ruta);
  }
  patch<T = any>(ruta: string, body: unknown) {
    return this.http.patch<T>(this.url + ruta, body);
  }
  blob(ruta: string) { return this.http.get(this.url + ruta, { responseType: 'blob' }); }
  abrirArchivo(ruta: string) {
    const ventana = window.open('', '_blank');
    this.blob(ruta).subscribe({
      next: (contenido) => {
        const url = URL.createObjectURL(contenido);
        if (ventana) ventana.location.replace(url);
        else window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: (e) => { ventana?.close(); alert(this.mensaje(e)); },
    });
  }
  descargar(ruta: string, nombre: string) {
    this.http.get(this.url + ruta, { responseType: 'blob' }).subscribe({
      next: (b) => {
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u;
        a.download = nombre;
        a.click();
        URL.revokeObjectURL(u);
      },
      error: (e) => alert(this.mensaje(e)),
    });
  }
  mensaje(e: any) {
    if (e instanceof HttpErrorResponse)
      return e.error?.mensaje || e.error?.message || 'Error HTTP ' + e.status;
    return 'Ocurrió un error';
  }
}
