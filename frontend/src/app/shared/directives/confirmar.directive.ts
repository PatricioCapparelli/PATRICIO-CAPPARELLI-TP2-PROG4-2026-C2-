import { Directive, inject, input, output } from '@angular/core';
import { ModalService } from '../../core/services/modal.service';

@Directive({
  selector: '[appConfirmar]',
  host: { '(click)': 'pedirConfirmacion()' },
})
export class Confirmar {
  private modal = inject(ModalService);

  mensaje = input('¿Querés continuar?', { alias: 'appConfirmar' });
  titulo = input('Confirmar acción');
  textoConfirmar = input('Confirmar');

  confirmado = output<void>();

  pedirConfirmacion() {
    this.modal.confirmar(this.titulo(), this.mensaje(), () => this.confirmado.emit(), {
      textoConfirmar: this.textoConfirmar(),
    });
  }
}
