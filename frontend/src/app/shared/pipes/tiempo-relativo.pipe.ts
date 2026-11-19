import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(valor: string | Date | null | undefined): string {
    if (!valor) return '';
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return '';

    const segundos = Math.floor((Date.now() - fecha.getTime()) / 1000);
    if (segundos < 45) return 'hace unos segundos';

    const minutos = Math.round(segundos / 60);
    if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;

    const horas = Math.round(minutos / 60);
    if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;

    const dias = Math.round(horas / 24);
    if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;

    return fecha.toLocaleDateString('es-AR');
  }
}
