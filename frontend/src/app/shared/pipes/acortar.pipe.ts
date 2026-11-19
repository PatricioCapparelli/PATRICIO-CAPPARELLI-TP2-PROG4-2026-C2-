import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'acortar' })
export class AcortarPipe implements PipeTransform {
  transform(texto: string | null | undefined, maximo = 120): string {
    if (!texto) return '';
    if (texto.length <= maximo) return texto;

    const corte = texto.slice(0, maximo);
    const ultimoEspacio = corte.lastIndexOf(' ');
    const base = ultimoEspacio > maximo * 0.6 ? corte.slice(0, ultimoEspacio) : corte;
    return `${base.trimEnd()}…`;
  }
}
