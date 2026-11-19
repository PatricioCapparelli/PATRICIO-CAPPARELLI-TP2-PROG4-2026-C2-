import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ComentariosService } from '../../../core/services/comentarios.service';
import { ModalService } from '../../../core/services/modal.service';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { ErrorCampo } from '../../../shared/components/error-campo/error-campo';
import { PublicacionItem } from '../../../shared/components/publicacion-item/publicacion-item';
import { Publicacion } from '../../../shared/models/publicacion';
import { InicialesPipe } from '../../../shared/pipes/iniciales.pipe';
import { UrlImagenPipe } from '../../../shared/pipes/url-imagen.pipe';
import { mensajesDeError } from '../../../shared/utils/errores';
import { fechaNoFutura } from '../../../shared/utils/validadores';

@Component({
  selector: 'app-mi-perfil',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    ErrorCampo,
    PublicacionItem,
    UrlImagenPipe,
    InicialesPipe,
  ],
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
  readonly auth = inject(AuthService);
  private publicacionesService = inject(PublicacionesService);
  private comentariosService = inject(ComentariosService);
  private usuariosService = inject(UsuariosService);
  private modal = inject(ModalService);
  private fb = inject(FormBuilder);

  publicaciones = signal<Publicacion[]>([]);
  cargando = signal(true);
  error = signal(false);

  editando = signal(false);
  guardando = signal(false);
  vistaPrevia = signal<string | null>(null);
  errorArchivo = signal('');

  private archivo: File | null = null;
  private archivoInput = viewChild<ElementRef<HTMLInputElement>>('archivoInput');

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
    descripcion: ['', [Validators.maxLength(200)]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.cargarPublicaciones();
  }

  invalido(c: AbstractControl) {
    return c.invalid && c.touched;
  }

  private cargarPublicaciones() {
    const id = this.auth.usuario()?._id;
    if (!id) return;

    this.publicacionesService
      .listar({ orden: 'fecha', offset: 0, limit: 3, usuario: id })
      .subscribe({
        next: (r) => {
          this.publicaciones.set(r.items);
          this.cargando.set(false);
          r.items.forEach((p) =>
            this.comentariosService.listar(p._id, 0, 5).subscribe({
              next: (c) =>
                this.publicaciones.update((lista) =>
                  lista.map((x) => (x._id === p._id ? { ...x, comentarios: c.items } : x)),
                ),
            }),
          );
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }

  editar() {
    const u = this.auth.usuario();
    if (!u) return;

    this.form.reset({
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      nombreUsuario: u.nombreUsuario,
      fechaNacimiento: u.fechaNacimiento.slice(0, 10),
      descripcion: u.descripcion ?? '',
    });
    this.archivo = null;
    this.vistaPrevia.set(null);
    this.errorArchivo.set('');
    this.editando.set(true);
  }

  cancelar() {
    this.editando.set(false);
  }

  onArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.errorArchivo.set('');
    this.vistaPrevia.set(null);
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
    const lector = new FileReader();
    lector.onload = () => this.vistaPrevia.set(lector.result as string);
    lector.readAsDataURL(file);
  }

  guardar() {
    if (this.form.invalid || this.errorArchivo()) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);

    const v = this.form.getRawValue();
    const datos = new FormData();
    datos.append('nombre', v.nombre);
    datos.append('apellido', v.apellido);
    datos.append('correo', v.correo);
    datos.append('nombreUsuario', v.nombreUsuario);
    datos.append('fechaNacimiento', v.fechaNacimiento);
    datos.append('descripcion', v.descripcion);
    if (this.archivo) datos.append('imagenPerfil', this.archivo);

    this.usuariosService.actualizarPerfil(datos).subscribe({
      next: (r) => {
        this.auth.actualizarUsuario(r.usuario);
        this.guardando.set(false);
        this.editando.set(false);
        this.cargarPublicaciones(); 
        this.modal.exito('Perfil actualizado', 'Tus datos se guardaron correctamente.');
      },
      error: (err) => {
        this.guardando.set(false);
        this.modal.error('No se pudo actualizar el perfil', mensajesDeError(err));
      },
    });
  }
}
