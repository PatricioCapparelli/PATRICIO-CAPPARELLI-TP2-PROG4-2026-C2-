import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { API_URL } from '../../../core/config';
import { AuthService } from '../../../core/services/auth.service';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { PublicacionItem } from '../../../shared/components/publicacion-item/publicacion-item';
import { Publicacion } from '../../../shared/models/publicacion';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, PublicacionItem],
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
  readonly auth = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  readonly apiUrl = API_URL;

  publicaciones = signal<Publicacion[]>([]);
  cargando = signal(true);
  error = signal(false);

  ngOnInit() {
    const id = this.auth.usuario()?._id;
    if (!id) return;

    // últimas 3 publicaciones del usuario
    this.publicacionesService
      .listar({ orden: 'fecha', offset: 0, limit: 3, usuario: id })
      .subscribe({
        next: (r) => {
          this.publicaciones.set(r.items);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }
}
