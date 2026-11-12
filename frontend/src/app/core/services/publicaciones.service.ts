import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {EstadoMeGusta,Orden,PaginaPublicaciones,Publicacion} from '../../shared/models/publicacion';

export interface OpcionesListado {
  orden: Orden;
  offset: number;
  limit: number;
  usuario?: string;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private http = inject(HttpClient);
  private url = `${environment.API_URL}/publicaciones`;

  listar(opciones: OpcionesListado) {
    let params = new HttpParams()
      .set('orden', opciones.orden)
      .set('offset', opciones.offset)
      .set('limit', opciones.limit);
    if (opciones.usuario) params = params.set('usuario', opciones.usuario);
    return this.http.get<PaginaPublicaciones>(this.url, { params });
  }

  crear(datos: FormData) {
    return this.http.post<Publicacion>(this.url, datos);
  }

  eliminar(id: string) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  darMeGusta(id: string) {
    return this.http.post<EstadoMeGusta>(`${this.url}/${id}/me-gusta`, {});
  }

  quitarMeGusta(id: string) {
    return this.http.delete<EstadoMeGusta>(`${this.url}/${id}/me-gusta`);
  }
}
