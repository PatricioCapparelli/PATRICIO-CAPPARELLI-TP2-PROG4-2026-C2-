import { HttpErrorResponse } from '@angular/common/http';

export function mensajesDeError(err: HttpErrorResponse): string[] {
  if (err.status === 0) {
    return ['No se pudo conectar con el servidor. Intentá nuevamente en unos minutos.'];
  }
  const msg = err.error?.message;
  if (Array.isArray(msg)) return msg;
  if (typeof msg === 'string') return [msg];
  return [`Ocurrió un error inesperado (código ${err.status ?? 'sin respuesta'}) en ${err.url ?? 'una URL desconocida'}.`];
}
