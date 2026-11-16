import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar {
  readonly auth = inject(AuthService);
  private modal = inject(ModalService);

  pedirCerrarSesion() {
    this.modal.confirmar(
      'Cerrar sesión',
      `¿Seguro que querés cerrar tu sesión, ${this.auth.usuario()?.nombreUsuario}?`,
      () => this.auth.logout(),
    );
  }
}