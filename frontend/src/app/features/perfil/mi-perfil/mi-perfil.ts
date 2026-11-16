import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ComentariosService } from '../../../core/services/comentarios.service';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { PublicacionItem } from '../../../shared/components/publicacion-item/publicacion-item';
import { Publicacion } from '../../../shared/models/publicacion';
import { UrlImagenPipe } from '../../../shared/pipes/url-imagen.pipe';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, PublicacionItem, UrlImagenPipe],
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
  readonly auth = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);

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
          // y los comentarios de cada una
          r.items.forEach((p) =>
            this.comentariosService.listar(p._id, 0, 5).subscribe({
              next: (c) =>
                this.publicaciones.update((lista) =>
                  lista.map((x) => (x._id === p._id ? { ...x, comentarios: c.items } : x)),
                ),
            }),
          );
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }
}
