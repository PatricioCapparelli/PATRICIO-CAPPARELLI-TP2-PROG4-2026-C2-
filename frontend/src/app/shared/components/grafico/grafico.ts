import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  Tooltip,
} from 'chart.js';
import type { ChartConfiguration } from 'chart.js';
import { TemaService } from '../../../core/services/tema.service';

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

export type TipoGrafico = 'bar' | 'line' | 'pie';

// Envoltorio de Chart.js. Los colores y las fuentes se leen de las variables CSS (styles.scss),
// y el gráfico se vuelve a dibujar cuando cambia el tema claro/oscuro.
@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.html',
})
export class Grafico {
  tipo = input.required<TipoGrafico>();
  etiquetas = input.required<string[]>();
  valores = input.required<number[]>();
  serie = input('Cantidad');
  descripcion = input('Gráfico');

  private tema = inject(TemaService);
  private lienzo = viewChild<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico?: Chart;

  constructor() {
    afterRenderEffect(() => {
      this.tema.tema(); // dependencia: si cambia el tema, se redibuja con los colores nuevos
      const canvas = this.lienzo()?.nativeElement;
      if (!canvas) return;
      this.dibujar(canvas, this.tipo(), this.etiquetas(), this.valores(), this.serie());
    });
    inject(DestroyRef).onDestroy(() => this.grafico?.destroy());
  }

  private dibujar(
    canvas: HTMLCanvasElement,
    tipo: TipoGrafico,
    etiquetas: string[],
    valores: number[],
    serie: string,
  ) {
    const css = getComputedStyle(document.documentElement);
    const color = (variable: string) => css.getPropertyValue(variable).trim();
    const paleta = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => color(`--grafico-${n}`));

    Chart.defaults.font.family = color('--fuente-texto');
    Chart.defaults.color = color('--texto');
    Chart.defaults.borderColor = color('--linea');

    this.grafico?.destroy();

    const esTorta = tipo === 'pie';
    const config = {
      type: tipo,
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: serie,
            data: valores,
            backgroundColor: esTorta ? etiquetas.map((_, i) => paleta[i % paleta.length]) : paleta[0],
            borderColor: esTorta ? color('--superficie') : tipo === 'line' ? paleta[0] : color('--grafico-borde'),
            borderWidth: esTorta ? 3 : tipo === 'line' ? 3 : 2,
            tension: 0.25,
            pointRadius: 4,
            pointBackgroundColor: paleta[1],
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: esTorta, position: 'bottom' },
        },
        scales: esTorta ? {} : { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    } as ChartConfiguration;

    this.grafico = new Chart(canvas, config);
  }
}
