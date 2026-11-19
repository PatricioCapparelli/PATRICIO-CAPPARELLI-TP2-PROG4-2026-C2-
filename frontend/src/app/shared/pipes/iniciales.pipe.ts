import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'iniciales' })
export class InicialesPipe implements PipeTransform {
  transform(persona: { nombre?: string; apellido?: string } | null | undefined): string {
    if (!persona) return '';
    return `${persona.nombre?.[0] ?? ''}${persona.apellido?.[0] ?? ''}`.toUpperCase();
  }
}
