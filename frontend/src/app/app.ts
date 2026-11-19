import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { TemaService } from './core/services/tema.service';
import { Modal } from './shared/components/modal/modal';
import { Navbar } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Modal],
  templateUrl: './app.html',
})
export class App {
  readonly auth = inject(AuthService);
  // al instanciarse, aplica el tema guardado apenas arranca la app
  private readonly tema = inject(TemaService);
}
