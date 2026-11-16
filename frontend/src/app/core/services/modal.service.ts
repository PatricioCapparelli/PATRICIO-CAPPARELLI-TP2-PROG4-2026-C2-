import { Injectable, signal } from '@angular/core';

export interface ModalData {
  tipo: 'exito' | 'error' | 'info' | 'confirmar';
  titulo: string;
  mensajes: string[];
  alAceptar?: () => void;
  textoConfirmar?: string;
  textoCancelar?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  modal = signal<ModalData | null>(null);

  exito(titulo: string, mensaje: string, alAceptar?: () => void) {
    this.modal.set({ tipo: 'exito', titulo, mensajes: [mensaje], alAceptar });
  }

  error(titulo: string, mensajes: string | string[]) {
    this.modal.set({
      tipo: 'error',
      titulo,
      mensajes: Array.isArray(mensajes) ? mensajes : [mensajes],
    });
  }

  info(titulo: string, mensaje: string) {
    this.modal.set({ tipo: 'info', titulo, mensajes: [mensaje] });
  }

  // Pide confirmación: solo ejecuta alConfirmar si el usuario acepta
  confirmar(
    titulo: string,
    mensaje: string,
    alConfirmar: () => void,
    opciones?: { textoConfirmar?: string; textoCancelar?: string },
  ) {
    this.modal.set({
      tipo: 'confirmar',
      titulo,
      mensajes: [mensaje],
      alAceptar: alConfirmar,
      ...opciones,
    });
  }

  cerrar() {
    const actual = this.modal();
    this.modal.set(null);
    actual?.alAceptar?.();
  }

  cancelar() {
    this.modal.set(null);
  }
}
