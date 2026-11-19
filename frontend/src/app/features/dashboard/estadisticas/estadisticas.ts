import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { EstadisticasService } from '../../../core/services/estadisticas.service';
import { diaYMes } from '../../../shared/utils/fechas';
import { PanelGrafico } from './panel-grafico/panel-grafico';

const recortar = (texto: string, maximo = 28) =>
  texto.length > maximo ? `${texto.slice(0, maximo).trimEnd()}…` : texto;

@Component({
  selector: 'app-estadisticas',
  imports: [PanelGrafico],
  templateUrl: './estadisticas.html',
})
export class Estadisticas {
  private servicio = inject(EstadisticasService);

  // Barras: publicaciones de cada usuario
  publicacionesPorUsuario = (desde: string, hasta: string) =>
    this.servicio.publicacionesPorUsuario(desde, hasta).pipe(
      map((filas) => ({
        etiquetas: filas.map((f) => `@${f.nombreUsuario}`),
        valores: filas.map((f) => f.cantidad),
      })),
    );

  // Líneas: comentarios por día
  comentariosPorDia = (desde: string, hasta: string) =>
    this.servicio.comentariosPorDia(desde, hasta).pipe(
      map((filas) => ({
        etiquetas: filas.map((f) => diaYMes(f.fecha)),
        valores: filas.map((f) => f.cantidad),
      })),
    );

  // Torta: comentarios en cada publicación
  comentariosPorPublicacion = (desde: string, hasta: string) =>
    this.servicio.comentariosPorPublicacion(desde, hasta).pipe(
      map((filas) => ({
        etiquetas: filas.map((f) => recortar(f.titulo)),
        valores: filas.map((f) => f.cantidad),
      })),
    );
}
