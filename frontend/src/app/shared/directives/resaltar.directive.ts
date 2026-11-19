import { Directive, ElementRef, input, inject } from '@angular/core';

@Directive({
  selector: '[appResaltar]',
  host: {
    '(mouseenter)': 'activar()',
    '(mouseleave)': 'desactivar()',
    '(focusin)': 'activar()',
    '(focusout)': 'desactivar()',
  },
})
export class Resaltar {
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  clase = input('', { alias: 'appResaltar' });

  activar() {
    this.elemento.nativeElement.classList.add(this.nombreClase());
  }

  desactivar() {
    this.elemento.nativeElement.classList.remove(this.nombreClase());
  }

  private nombreClase() {
    return this.clase() || 'resaltado';
  }
}
