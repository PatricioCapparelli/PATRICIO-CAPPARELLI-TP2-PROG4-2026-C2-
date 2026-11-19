import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ComentariosService } from '../../../core/services/comentarios.service';
import { ModalService } from '../../../core/services/modal.service';
import { ErrorCampo } from '../../../shared/components/error-campo/error-campo';
import { Comentario } from '../../../shared/models/publicacion';
import { InicialesPipe } from '../../../shared/pipes/iniciales.pipe';
import { TiempoRelativoPipe } from '../../../shared/pipes/tiempo-relativo.pipe';
import { UrlImagenPipe } from '../../../shared/pipes/url-imagen.pipe';
import { mensajesDeError } from '../../../shared/utils/errores';

const VALIDADORES = [Validators.required, Validators.maxLength(500), Validators.pattern(/\S/)];

@Component({
  selector: 'app-comentarios',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    ErrorCampo,
    UrlImagenPipe,
    InicialesPipe,
    TiempoRelativoPipe,
  ],
  templateUrl: './comentarios.html',
})
export class Comentarios implements OnInit {
  publicacionId = input.required<string>();

  private fb = inject(FormBuilder);
  private comentariosService = inject(ComentariosService);
  private modal = inject(ModalService);
  private auth = inject(AuthService);

  readonly limite = 5;

  comentarios = signal<Comentario[]>([]);
  total = signal(0);
  cargando = signal(false);
  enviando = signal(false);
  guardando = signal(false);
  editandoId = signal<string | null>(null);
  hayMas = computed(() => this.comentarios().length < this.total());

  form = this.fb.nonNullable.group({
    mensaje: ['', VALIDADORES],
  });
  edicion = new FormControl('', { nonNullable: true, validators: VALIDADORES });

  ngOnInit() {
    this.cargar();
  }

  invalido(c: AbstractControl) {
    return c.invalid && c.touched;
  }

  esMio(c: Comentario) {
    return c.autor._id === this.auth.usuario()?._id;
  }

  // Primera carga y botón "Cargar más": trae la siguiente tanda sin borrar las anteriores
  cargar() {
    this.cargando.set(true);
    this.comentariosService
      .listar(this.publicacionId(), this.comentarios().length, this.limite)
      .subscribe({
        next: (r) => {
          const existentes = new Set(this.comentarios().map((c) => c._id));
          this.comentarios.update((lista) => [
            ...lista,
            ...r.items.filter((c) => !existentes.has(c._id)),
          ]);
          this.total.set(r.total);
          this.cargando.set(false);
        },
        error: (err) => {
          this.cargando.set(false);
          this.modal.error('No se pudieron cargar los comentarios', mensajesDeError(err));
        },
      });
  }

  publicar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);

    this.comentariosService
      .crear(this.publicacionId(), this.form.getRawValue().mensaje)
      .subscribe({
        next: (nuevo) => {
          this.comentarios.update((lista) => [nuevo, ...lista]);
          this.total.update((t) => t + 1);
          this.form.reset();
          this.enviando.set(false);
        },
        error: (err) => {
          this.enviando.set(false);
          this.modal.error('No se pudo publicar el comentario', mensajesDeError(err));
        },
      });
  }

  editar(c: Comentario) {
    this.edicion.setValue(c.mensaje);
    this.edicion.markAsUntouched();
    this.editandoId.set(c._id);
  }

  cancelarEdicion() {
    this.editandoId.set(null);
  }

  guardarEdicion(c: Comentario) {
    if (this.edicion.invalid) {
      this.edicion.markAsTouched();
      return;
    }
    this.guardando.set(true);

    this.comentariosService
      .modificar(this.publicacionId(), c._id, this.edicion.value)
      .subscribe({
        next: (actualizado) => {
          this.comentarios.update((lista) =>
            lista.map((x) => (x._id === actualizado._id ? actualizado : x)),
          );
          this.editandoId.set(null);
          this.guardando.set(false);
        },
        error: (err) => {
          this.guardando.set(false);
          this.modal.error('No se pudo editar el comentario', mensajesDeError(err));
        },
      });
  }
}
