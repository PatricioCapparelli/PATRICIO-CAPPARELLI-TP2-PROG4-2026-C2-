import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordFuerte: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v: string = c.value ?? '';
  if (!v) return null;
  const errores: ValidationErrors = {};
  if (!/[A-Z]/.test(v)) errores['sinMayuscula'] = true;
  if (!/\d/.test(v)) errores['sinNumero'] = true;
  return Object.keys(errores).length ? errores : null;
};

export const passwordsIguales: ValidatorFn = (g: AbstractControl): ValidationErrors | null => {
  const p = g.get('password')?.value;
  const r = g.get('repetirPassword')?.value;
  return p && r && p !== r ? { passwordsDistintas: true } : null;
};

export const fechaNoFutura: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  if (!c.value) return null;
  return new Date(c.value) > new Date() ? { fechaFutura: true } : null;
};
