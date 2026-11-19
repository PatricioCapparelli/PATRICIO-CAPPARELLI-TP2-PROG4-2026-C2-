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

  private lienzo = viewChild<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico?: Chart;

  constructor() {
    afterRenderEffect(() => {
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
    const paleta = [
      '--marron-oscuro',
      '--terracota',
      '--oliva',
      '--taupe',
      '--gris-verde',
      '--marron',
      '--arena',
      '--ladrillo',
    ].map(color);

    Chart.defaults.font.family = color('--fuente-texto');
    Chart.defaults.color = color('--marron-oscuro');

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
            backgroundColor: esTorta
              ? etiquetas.map((_, i) => paleta[i % paleta.length])
              : tipo === 'line'
                ? color('--terracota')
                : color('--marron'),
            borderColor: esTorta ? color('--papel') : color('--marron-oscuro'),
            borderWidth: esTorta ? 3 : tipo === 'line' ? 3 : 2,
            tension: 0.25,
            pointRadius: 4,
            pointBackgroundColor: color('--terracota'),
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
