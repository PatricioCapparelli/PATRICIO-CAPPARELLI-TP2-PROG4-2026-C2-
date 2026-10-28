import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { API_URL } from '../../../core/config';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe],
  templateUrl: './mi-perfil.html',
})
export class MiPerfil {
  readonly auth = inject(AuthService);
  readonly apiUrl = API_URL;
}
