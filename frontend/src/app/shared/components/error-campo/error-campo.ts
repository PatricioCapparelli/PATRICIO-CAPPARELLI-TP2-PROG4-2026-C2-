import { Component, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-error-campo',
  templateUrl: './error-campo.html',
})
export class ErrorCampo {
  control = input.required<AbstractControl>();

  mensaje(e: ValidationErrors): string {
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['email']) return 'Ingresá un correo válido (ej: nombre@dominio.com).';
    if (e['minlength']) return `Debe tener al menos ${e['minlength'].requiredLength} caracteres.`;
    if (e['maxlength']) return `No puede superar los ${e['maxlength'].requiredLength} caracteres.`;
    if (e['sinMayuscula']) return 'La contraseña debe incluir al menos una mayúscula.';
    if (e['sinNumero']) return 'La contraseña debe incluir al menos un número.';
    if (e['fechaFutura']) return 'La fecha de nacimiento no puede ser futura.';
    return 'Valor inválido.';
  }
}
