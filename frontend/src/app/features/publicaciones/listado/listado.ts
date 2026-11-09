import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { ErrorCampo } from '../../../shared/components/error-campo/error-campo';
import { PublicacionItem } from '../../../shared/components/publicacion-item/publicacion-item';
import { Orden, Publicacion } from '../../../shared/models/publicacion';
import { mensajesDeError } from '../../../shared/utils/errores';

@Component({
  selector: 'app-listado',
  imports: [ReactiveFormsModule, ErrorCampo, PublicacionItem],
  templateUrl: './listado.html',
})
export class Listado implements OnInit {
  private fb = inject(FormBuilder);
  private publicacionesService = inject(PublicacionesService);
  private modal = inject(ModalService);
  readonly auth = inject(AuthService);

  readonly limite = 5;

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  pagina = signal(1);
  orden = signal<Orden>('fecha');
  cargando = signal(false);
  creando = signal(false);
  errorArchivo = signal('');
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.limite)));

  private archivo: File | null = null;
  private archivoInput = viewChild<ElementRef<HTMLInputElement>>('archivoInput');

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  get f() {
    return this.form.controls;
  }

  invalido(c: AbstractControl) {
    return c.invalid && c.touched;
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.publicacionesService
      .listar({
        orden: this.orden(),
        offset: (this.pagina() - 1) * this.limite,
        limit: this.limite,
      })
      .subscribe({
        next: (r) => {
          // si la página quedó vacía (por ejemplo tras eliminar), volvemos a la última
          if (r.items.length === 0 && this.pagina() > 1) {
            this.pagina.set(Math.max(1, Math.ceil(r.total / this.limite)));
            this.cargar();
            return;
          }
          this.publicaciones.set(r.items);
          this.total.set(r.total);
          this.cargando.set(false);
        },
        error: (err) => {
          this.cargando.set(false);
          this.modal.error('No se pudieron cargar las publicaciones', mensajesDeError(err));
        },
      });
  }

  cambiarOrden(orden: Orden) {
    if (this.orden() === orden) return;
    this.orden.set(orden);
    this.pagina.set(1);
    this.cargar();
  }

  irA(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.pagina.set(pagina);
    this.cargar();
  }

  puedeEliminar(p: Publicacion) {
    const usuario = this.auth.usuario();
    return !!usuario && (p.autor._id === usuario._id || usuario.perfil === 'administrador');
  }

  alternarMeGusta(p: Publicacion) {
    const llamada = p.meGustaMio
      ? this.publicacionesService.quitarMeGusta(p._id)
      : this.publicacionesService.darMeGusta(p._id);

    llamada.subscribe({
      next: (estado) =>
        this.publicaciones.update((lista) =>
          lista.map((x) => (x._id === p._id ? { ...x, ...estado } : x)),
        ),
      error: (err) => this.modal.error('No se pudo actualizar el me gusta', mensajesDeError(err)),
    });
  }

  pedirEliminar(p: Publicacion) {
    this.modal.confirmar(
      'Eliminar publicación',
      `¿Seguro que querés eliminar "${p.titulo}"?`,
      () => this.eliminar(p),
    );
  }

  private eliminar(p: Publicacion) {
    this.publicacionesService.eliminar(p._id).subscribe({
      next: () => {
        this.cargar();
        this.modal.exito('Publicación eliminada', 'La publicación se eliminó correctamente.');
      },
      error: (err) => this.modal.error('No se pudo eliminar la publicación', mensajesDeError(err)),
    });
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
    if (file.size > 5 * 1024 * 1024) {
      this.errorArchivo.set('La imagen no puede superar los 5 MB.');
      input.value = '';
      return;
    }
    this.archivo = file;
  }

  publicar() {
    if (this.form.invalid || this.errorArchivo()) {
      this.form.markAllAsTouched();
      return;
    }
    this.creando.set(true);

    const v = this.form.getRawValue();
    const datos = new FormData();
    datos.append('titulo', v.titulo);
    datos.append('descripcion', v.descripcion);
    if (this.archivo) datos.append('imagen', this.archivo);

    this.publicacionesService.crear(datos).subscribe({
      next: () => {
        this.creando.set(false);
        this.form.reset();
        this.archivo = null;
        const input = this.archivoInput()?.nativeElement;
        if (input) input.value = '';
        this.orden.set('fecha');
        this.pagina.set(1);
        this.cargar();
        this.modal.exito('Publicación creada', 'Tu publicación ya está visible.');
      },
      error: (err) => {
        this.creando.set(false);
        this.modal.error('No se pudo crear la publicación', mensajesDeError(err));
      },
    });
  }
}
