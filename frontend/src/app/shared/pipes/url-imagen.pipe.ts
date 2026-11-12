import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({ name: 'urlImagen', standalone: true })
export class UrlImagenPipe implements PipeTransform {
    transform(ruta: string | null | undefined): string {
        if (!ruta || typeof ruta !== 'string') return '';

        if (ruta.startsWith('http://') || ruta.startsWith('https://')) {
            return ruta;
        }

        const baseUrl = environment.API_URL.endsWith('/') 
            ? environment.API_URL.slice(0, -1) 
            : environment.API_URL;
            
        const cleanRuta = ruta.startsWith('/') ? ruta : `/${ruta}`;

        return `${baseUrl}${cleanRuta}`;
    }
}