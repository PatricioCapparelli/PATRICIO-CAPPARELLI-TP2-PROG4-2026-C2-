import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { ErrorCampo } from '../../../shared/components/error-campo/error-campo';
import { Confirmar } from '../../../shared/directives/confirmar.directive';
import { Resaltar } from '../../../shared/directives/resaltar.directive';
import { Usuario } from '../../../shared/models/usuario';
import { InicialesPipe } from '../../../shared/pipes/iniciales.pipe';
import { TiempoRelativoPipe } from '../../../shared/pipes/tiempo-relativo.pipe';
import { UrlImagenPipe } from '../../../shared/pipes/url-imagen.pipe';
import { mensajesDeError } from '../../../shared/utils/errores';
import { fechaNoFutura, passwordFuerte, passwordsIguales } from '../../../shared/utils/validadores';

@Component({
  selector: 'app-usuarios',
  imports: [
    ReactiveFormsModule,
    ErrorCampo,
    UrlImagenPipe,
    InicialesPipe,
    TiempoRelativoPipe,
    Resaltar,
    Confirmar,
  ],
  templateUrl: './usuarios.html',
})
export class Usuarios implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private modal = inject(ModalService);
  readonly auth = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  creando = signal(false);
  errorArchivo = signal('');

  private archivo: File | null = null;
  private archivoInput = viewChild<ElementRef<HTMLInputElement>>('archivoInput');

  form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8), passwordFuerte]],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
      descripcion: ['', [Validators.maxLength(200)]],
      perfil: ['usuario', [Validators.required]], 
    },
    { validators: passwordsIguales },
  );

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.cargar();
  }

  invalido(c: AbstractControl) {
    return c.invalid && c.touched;
  }

  repetirInvalido() {
    return (
      this.invalido(this.f.repetirPassword) ||
      (!!this.form.errors?.['passwordsDistintas'] && this.f.repetirPassword.touched)
    );
  }

  esActivo(u: Usuario) {
    return u.activo !== false;
  }

  esYo(u: Usuario) {
    return u._id === this.auth.usuario()?._id;
  }

  cargar() {
    this.cargando.set(true);
    this.usuariosService.listar().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.modal.error('No se pudo cargar el listado de usuarios', mensajesDeError(err));
      },
    });
  }

  deshabilitar(u: Usuario) {
    this.usuariosService.deshabilitar(u._id).subscribe({
      next: (actualizado) => this.reemplazar(actualizado),
      error: (err) => this.modal.error('No se pudo deshabilitar al usuario', mensajesDeError(err)),
    });
  }

  habilitar(u: Usuario) {
    this.usuariosService.habilitar(u._id).subscribe({
      next: (actualizado) => this.reemplazar(actualizado),
      error: (err) => this.modal.error('No se pudo habilitar al usuario', mensajesDeError(err)),
    });
  }

  private reemplazar(actualizado: Usuario) {
    this.usuarios.update((lista) =>
      lista.map((x) => (x._id === actualizado._id ? { ...x, ...actualizado } : x)),
    );
  }

  onArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.errorArchivo.set('');
    this.archivo = null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorArchivo.set('El archivo debe ser una imagen.');
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.errorArchivo.set('La imagen no puede superar los 2 MB.');
      input.value = '';
      return;
    }
    this.archivo = file;
  }

  crear() {
    if (this.form.invalid || this.errorArchivo()) {
      this.form.markAllAsTouched();
      return;
    }
    this.creando.set(true);

    const v = this.form.getRawValue();
    const datos = new FormData();
    datos.append('nombre', v.nombre);
    datos.append('apellido', v.apellido);
    datos.append('correo', v.correo);
    datos.append('nombreUsuario', v.nombreUsuario);
    datos.append('password', v.password);
    datos.append('fechaNacimiento', v.fechaNacimiento);
    datos.append('descripcion', v.descripcion);
    datos.append('perfil', v.perfil);
    if (this.archivo) datos.append('imagenPerfil', this.archivo);

    this.usuariosService.crear(datos).subscribe({
      next: (nuevo) => {
        this.usuarios.update((lista) => [nuevo, ...lista]);
        this.form.reset();
        this.archivo = null;
        const input = this.archivoInput()?.nativeElement;
        if (input) input.value = '';
        this.creando.set(false);
        this.modal.exito('Usuario creado', `Se creó a ${nuevo.nombre} ${nuevo.apellido}.`);
      },
      error: (err) => {
        this.creando.set(false);
        this.modal.error('No se pudo crear el usuario', mensajesDeError(err));
      },
    });
  }
}
