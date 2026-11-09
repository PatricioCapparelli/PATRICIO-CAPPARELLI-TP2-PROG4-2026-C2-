import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { API_URL } from '../../../core/config';
import { Publicacion } from '../../models/publicacion';

@Component({
  selector: 'app-publicacion-item',
  imports: [DatePipe],
  templateUrl: './publicacion-item.html',
})
export class PublicacionItem {
  publicacion = input.required<Publicacion>();
  puedeEliminar = input(false);
  soloLectura = input(false);
  mostrarComentarios = input(false);

  meGusta = output<void>();
  eliminar = output<void>();

  readonly apiUrl = API_URL;
}
