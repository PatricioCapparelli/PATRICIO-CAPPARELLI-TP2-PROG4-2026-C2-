import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaAuth, RespuestaAutorizar, Usuario } from '../../shared/models/usuario';
import { ModalService } from './modal.service';

const CLAVE_USUARIO = 'usuario';
const VIDA_TOKEN_MS = 15 * 60 * 1000; // el token vence a los 15 minutos
const AVISO_ANTES_MS = 5 * 60 * 1000; // se avisa cuando quedan 5 minutos

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private modal = inject(ModalService);

  usuario = signal<Usuario | null>(this.leerUsuario());
  logueado = computed(() => !!this.usuario());

  // true cuando ya se le preguntó al backend si la sesión (cookie) es válida
  verificada = signal(false);

  private temporizadorAviso?: ReturnType<typeof setTimeout>;
  private temporizadorCierre?: ReturnType<typeof setTimeout>;

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

  // Pantalla de carga: el backend valida la cookie y devuelve los datos del usuario
  autorizar() {
    return this.http
      .post<RespuestaAutorizar>(`${environment.API_URL}/auth/autorizar`, {})
      .pipe(
        tap((r) => {
          this.guardarUsuario(r.usuario);
          this.iniciarContador(r.expiraEn - Date.now());
        }),
        map(() => true),
        catchError(() => {
          this.limpiarSesion();
          return of(false);
        }),
        tap(() => this.verificada.set(true)),
      );
  }

  logout() {
    this.http.post(`${environment.API_URL}/auth/logout`, {}).subscribe({ error: () => undefined });
    this.limpiarSesion();
    this.router.navigate(['/login']);
  }

  actualizarUsuario(usuario: Usuario) {
  this.guardarUsuario(usuario);
}

  private guardarSesion(r: RespuestaAuth) {
    this.guardarUsuario(r.usuario);
    this.verificada.set(true);
    this.iniciarContador(VIDA_TOKEN_MS);
  }

  private guardarUsuario(usuario: Usuario) {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  private limpiarSesion() {
    this.detenerContador();
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuario.set(null);
  }

  // ---------- contador de sesión ----------

  // A los 10 minutos de iniciada la sesión (5 antes de que venza) se avisa al usuario
  private iniciarContador(vidaRestanteMs: number) {
    this.detenerContador();
    const hastaAviso = Math.max(0, vidaRestanteMs - AVISO_ANTES_MS);
    const restanteAlAvisar = Math.max(0, vidaRestanteMs - hastaAviso);
    this.temporizadorAviso = setTimeout(() => this.avisarVencimiento(restanteAlAvisar), hastaAviso);
  }

  private detenerContador() {
    clearTimeout(this.temporizadorAviso);
    clearTimeout(this.temporizadorCierre);
  }

  private avisarVencimiento(restanteMs: number) {
    const minutos = Math.max(1, Math.round(restanteMs / 60000));
    this.modal.confirmar(
      'Tu sesión está por vencer',
      `Te quedan ${minutos} minuto(s) de sesión. ¿Querés extenderla?`,
      () => this.extenderSesion(),
      { textoConfirmar: 'Extender sesión', textoCancelar: 'No, gracias' },
    );

    // si no se extiende, al vencer el token se cierra la sesión
    this.temporizadorCierre = setTimeout(() => {
      this.logout();
      this.modal.info('Tu sesión expiró', 'Volvé a iniciar sesión para continuar.');
    }, restanteMs);
  }

  private extenderSesion() {
    this.http.post(`${environment.API_URL}/auth/refrescar`, {}).subscribe({
      next: () => {
        this.iniciarContador(VIDA_TOKEN_MS);
        this.modal.exito('Sesión extendida', 'Tu sesión se extendió por 15 minutos más.');
      },
      error: () => {
        this.logout();
        this.modal.error('No se pudo extender la sesión', 'Volvé a iniciar sesión.');
      },
    });
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
