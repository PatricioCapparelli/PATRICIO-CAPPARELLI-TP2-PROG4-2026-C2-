import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { PublicacionItem } from '../../../shared/components/publicacion-item/publicacion-item';
import { Publicacion } from '../../../shared/models/publicacion';
import { mensajesDeError } from '../../../shared/utils/errores';
import { Comentarios } from '../comentarios/comentarios';

@Component({
  selector: 'app-detalle',
  imports: [RouterLink, PublicacionItem, Comentarios],
  templateUrl: './detalle.html',
})
export class Detalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private publicacionesService = inject(PublicacionesService);
  private modal = inject(ModalService);
  private auth = inject(AuthService);

  publicacion = signal<Publicacion | null>(null);
  cargando = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.publicacionesService.obtener(id).subscribe({
      next: (p) => {
        this.publicacion.set(p);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  puedeEliminar(p: Publicacion) {
    const usuario = this.auth.usuario();
    return !!usuario && (p.autor._id === usuario._id || usuario.perfil === 'administrador');
  }

  alternarMeGusta() {
    const p = this.publicacion();
    if (!p) return;

    const llamada = p.meGustaMio
      ? this.publicacionesService.quitarMeGusta(p._id)
      : this.publicacionesService.darMeGusta(p._id);

    llamada.subscribe({
      next: (estado) => this.publicacion.update((x) => (x ? { ...x, ...estado } : x)),
      error: (err) => this.modal.error('No se pudo actualizar el me gusta', mensajesDeError(err)),
    });
  }

  pedirEliminar() {
    const p = this.publicacion();
    if (!p) return;
    this.modal.confirmar(
      'Eliminar publicación',
      `¿Seguro que querés eliminar "${p.titulo}"?`,
      () => this.eliminar(p._id),
    );
  }

  private eliminar(id: string) {
    this.publicacionesService.eliminar(id).subscribe({
      next: () => {
        this.router.navigate(['/publicaciones']);
        this.modal.exito('Publicación eliminada', 'La publicación se eliminó correctamente.');
      },
      error: (err) => this.modal.error('No se pudo eliminar la publicación', mensajesDeError(err)),
    });
  }
}
