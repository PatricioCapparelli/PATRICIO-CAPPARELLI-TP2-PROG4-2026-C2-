import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';
import { ErrorCampo } from '../../../shared/components/error-campo/error-campo';
import { mensajesDeError } from '../../../shared/utils/errores';
import { fechaNoFutura, passwordFuerte, passwordsIguales } from '../../../shared/utils/validadores';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  templateUrl: './registro.html',
})
export class Registro {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private modal = inject(ModalService);

  cargando = signal(false);
  vistaPrevia = signal<string | null>(null);
  errorArchivo = signal('');
  private archivo: File | null = null;

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
    },
    { validators: passwordsIguales },
  );

  get f() {
    return this.form.controls;
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

  enviar() {
    if (this.form.invalid || this.errorArchivo()) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);

    const v = this.form.getRawValue();
    const datos = new FormData();
    datos.append('nombre', v.nombre);
    datos.append('apellido', v.apellido);
    datos.append('correo', v.correo);
    datos.append('nombreUsuario', v.nombreUsuario);
    datos.append('password', v.password);
    datos.append('fechaNacimiento', v.fechaNacimiento);
    datos.append('descripcion', v.descripcion);
    if (this.archivo) datos.append('imagenPerfil', this.archivo);

    this.auth.registro(datos).subscribe({
      next: (r) =>
        this.modal.exito(
          '¡Registro exitoso!',
          `Te damos la bienvenida, ${r.usuario.nombre}.`,
          () => this.router.navigate(['/publicaciones']),
        ),
      error: (err) => {
        this.cargando.set(false);
        this.modal.error('No se pudo completar el registro', mensajesDeError(err));
      },
    });
  }
}
