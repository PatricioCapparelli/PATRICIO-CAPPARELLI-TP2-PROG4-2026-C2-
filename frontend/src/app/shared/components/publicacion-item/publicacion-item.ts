import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Publicacion } from '../../models/publicacion';
import { UrlImagenPipe } from '../../pipes/url-imagen.pipe';

@Component({
  selector: 'app-publicacion-item',
  imports: [DatePipe, UrlImagenPipe],
  templateUrl: './publicacion-item.html',
})
export class PublicacionItem {
  readonly apiUrl = environment.API_URL;
  
  publicacion = input.required<Publicacion>();
  puedeEliminar = input(false);
  soloLectura = input(false);
  mostrarComentarios = input(false);

  meGusta = output<void>();
  eliminar = output<void>();
}