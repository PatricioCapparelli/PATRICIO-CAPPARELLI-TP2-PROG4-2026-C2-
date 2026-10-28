import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../core/services/modal.service';
import { ErrorCampo } from '../../../shared/components/error-campo/error-campo';
import { mensajesDeError } from '../../../shared/utils/errores';
import { passwordFuerte } from '../../../shared/utils/validadores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private modal = inject(ModalService);

  cargando = signal(false);

  form = this.fb.nonNullable.group({
    identificador: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8), passwordFuerte]],
  });

  get f() {
    return this.form.controls;
  }

  invalido(c: AbstractControl) {
    return c.invalid && c.touched;
  }

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    const { identificador, password } = this.form.getRawValue();

    this.auth.login(identificador, password).subscribe({
      next: () => this.router.navigate(['/publicaciones']),
      error: (err) => {
        this.cargando.set(false);
        this.modal.error('No se pudo iniciar sesión', mensajesDeError(err));
      },
    });
  }
}
