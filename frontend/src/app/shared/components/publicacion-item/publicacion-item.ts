import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../models/publicacion';
import { AcortarPipe } from '../../pipes/acortar.pipe';
import { InicialesPipe } from '../../pipes/iniciales.pipe';
import { UrlImagenPipe } from '../../pipes/url-imagen.pipe';

@Component({
  selector: 'app-publicacion-item',
  imports: [DatePipe, RouterLink, UrlImagenPipe, InicialesPipe, AcortarPipe],
  templateUrl: './publicacion-item.html',
})
export class PublicacionItem {
  publicacion = input.required<Publicacion>();
  puedeEliminar = input(false); // el autor o un administrador
  soloLectura = input(false);
  mostrarComentarios = input(false);
  grande = input(false); // vista de detalle

  meGusta = output<void>();
  eliminar = output<void>();
}
