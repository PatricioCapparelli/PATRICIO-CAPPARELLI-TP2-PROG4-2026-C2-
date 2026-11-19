import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TemaService } from '../../../core/services/tema.service';
import { SoloAdmin } from '../../directives/solo-admin.directive';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, SoloAdmin],
  templateUrl: './navbar.html',
})
export class Navbar {
  readonly auth = inject(AuthService);
  readonly tema = inject(TemaService);
}
