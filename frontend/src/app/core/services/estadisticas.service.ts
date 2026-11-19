import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  ComentarioPorDia,
  ComentarioPorPublicacion,
  PublicacionPorUsuario,
} from '../../shared/models/estadisticas';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private http = inject(HttpClient);
  private url = `${environment.API_URL}/estadisticas`;

  private lapso(desde: string, hasta: string) {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }

  publicacionesPorUsuario(desde: string, hasta: string) {
    return this.http.get<PublicacionPorUsuario[]>(`${this.url}/publicaciones-por-usuario`, {
      params: this.lapso(desde, hasta),
    });
  }

  comentariosPorDia(desde: string, hasta: string) {
    return this.http.get<ComentarioPorDia[]>(`${this.url}/comentarios-por-dia`, {
      params: this.lapso(desde, hasta),
    });
  }

  comentariosPorPublicacion(desde: string, hasta: string, limite = 8) {
    return this.http.get<ComentarioPorPublicacion[]>(`${this.url}/comentarios-por-publicacion`, {
      params: this.lapso(desde, hasta).set('limite', limite),
    });
  }
}
