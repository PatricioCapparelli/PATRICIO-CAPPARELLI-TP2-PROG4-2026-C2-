import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../shared/models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private url = `${environment.API_URL}/usuarios`;

  // ---------- perfil propio ----------
  actualizarPerfil(datos: FormData) {
    return this.http.put<{ usuario: Usuario }>(`${environment.API_URL}/perfil`, datos);
  }

  // ---------- administración ----------
  listar() {
    return this.http.get<Usuario[]>(this.url);
  }

  crear(datos: FormData) {
    return this.http.post<Usuario>(this.url, datos);
  }

  // baja lógica
  deshabilitar(id: string) {
    return this.http.delete<Usuario>(`${this.url}/${id}`);
  }

  // alta lógica
  habilitar(id: string) {
    return this.http.post<Usuario>(`${this.url}/${id}/habilitar`, {});
  }
}
