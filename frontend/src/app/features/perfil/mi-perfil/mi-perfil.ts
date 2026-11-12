import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
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

  publicaciones = signal<Publicacion[]>([]);
  cargando = signal(true);
  error = signal(false);

  ngOnInit() {
    const id = this.auth.usuario()?._id;
    if (!id) return;

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
