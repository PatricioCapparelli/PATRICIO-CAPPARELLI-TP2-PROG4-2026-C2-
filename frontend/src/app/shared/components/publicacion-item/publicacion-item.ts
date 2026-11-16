import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../models/publicacion';
import { UrlImagenPipe } from '../../pipes/url-imagen.pipe';

@Component({
  selector: 'app-publicacion-item',
  imports: [DatePipe, RouterLink, UrlImagenPipe],
  templateUrl: './publicacion-item.html',
})
export class PublicacionItem {
  publicacion = input.required<Publicacion>();
  puedeEliminar = input(false);
  soloLectura = input(false);
  mostrarComentarios = input(false);
  grande = input(false);

  meGusta = output<void>();
  eliminar = output<void>();
}
