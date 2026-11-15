import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaAuth, Usuario } from '../../shared/models/usuario';

const CLAVE_USUARIO = 'usuario'; 

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  usuario = signal<Usuario | null>(this.leerUsuario());
  logueado = computed(() => !!this.usuario());

  registro(datos: FormData) {
    return this.http
      .post<RespuestaAuth>(`${environment.API_URL}/auth/registro`, datos)
      .pipe(tap((r) => this.guardarSesion(r)));
  }

  login(identificador: string, password: string) {
    return this.http
      .post<RespuestaAuth>(`${environment.API_URL}/auth/login`, { identificador, password })
      .pipe(tap((r) => this.guardarSesion(r)));
  }

  logout() {
    this.http.post(`${environment.API_URL}/auth/logout`, {}).subscribe({ error: () => undefined });
    localStorage.removeItem(CLAVE_USUARIO); 
    this.usuario.set(null);
    this.router.navigate(['/login']);
  }

  private guardarSesion(r: RespuestaAuth) {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(r.usuario));
    this.usuario.set(r.usuario);
  }

  private leerUsuario(): Usuario | null {
    try {
      const raw = localStorage.getItem(CLAVE_USUARIO);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
