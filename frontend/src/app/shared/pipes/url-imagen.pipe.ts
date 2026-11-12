import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({ name: 'urlImagen' })
export class UrlImagenPipe implements PipeTransform {
    transform(ruta: string | null | undefined): string {
        if (!ruta) return '';
        return ruta.startsWith('http') ? ruta : `${environment.API_URL}${ruta}`;
    }
}