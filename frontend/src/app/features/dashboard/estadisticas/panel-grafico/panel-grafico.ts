import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ModalService } from '../../../../core/services/modal.service';
import { Grafico, TipoGrafico } from '../../../../shared/components/grafico/grafico';
import { fechaLocal } from '../../../../shared/utils/fechas';
import { mensajesDeError } from '../../../../shared/utils/errores';

export interface DatosGrafico {
  etiquetas: string[];
  valores: number[];
}

let contador = 0;

// Un gráfico con su propio selector de lapso de tiempo
@Component({
  selector: 'app-panel-grafico',
  imports: [ReactiveFormsModule, Grafico],
  templateUrl: './panel-grafico.html',
})
export class PanelGrafico implements OnInit {
  titulo = input.required<string>();
  descripcion = input('');
  tipo = input.required<TipoGrafico>();
  serie = input('Cantidad');
  cargar = input.required<(desde: string, hasta: string) => Observable<DatosGrafico>>();

  private fb = inject(FormBuilder);
  private modal = inject(ModalService);

  readonly uid = ++contador; // ids únicos de los campos de fecha
  readonly hoy = fechaLocal(0);

  etiquetas = signal<string[]>([]);
  valores = signal<number[]>([]);
  cargando = signal(false);
  hayDatos = computed(() => this.valores().some((v) => v > 0));

  form = this.fb.nonNullable.group({
    desde: [fechaLocal(29), Validators.required],
    hasta: [fechaLocal(0), Validators.required],
  });

  ngOnInit() {
    this.actualizar();
  }

  // atajos: últimos 7, 30 o 90 días
  atajo(dias: number) {
    this.form.setValue({ desde: fechaLocal(dias - 1), hasta: fechaLocal(0) });
    this.actualizar();
  }

  actualizar() {
    const { desde, hasta } = this.form.getRawValue();
    if (this.form.invalid || desde > hasta) {
      this.modal.error(
        'Lapso no válido',
        'Elegí dos fechas válidas: "Desde" no puede ser posterior a "Hasta".',
      );
      return;
    }

    this.cargando.set(true);
    this.cargar()(desde, hasta).subscribe({
      next: (datos) => {
        this.etiquetas.set(datos.etiquetas);
        this.valores.set(datos.valores);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.modal.error('No se pudieron cargar las estadísticas', mensajesDeError(err));
      },
    });
  }
}
