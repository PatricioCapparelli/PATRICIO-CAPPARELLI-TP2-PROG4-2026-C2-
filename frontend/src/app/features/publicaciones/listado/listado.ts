import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.html',
})
export class Listado {
  readonly auth = inject(AuthService);
}
