import { Injectable, signal } from '@angular/core';

export type Tema = 'claro' | 'oscuro';

const CLAVE_TEMA = 'tema';

@Injectable({ providedIn: 'root' })
export class TemaService {
  tema = signal<Tema>(this.inicial());

  constructor() {
    this.aplicar(this.tema());
  }

  alternar() {
    const nuevo: Tema = this.tema() === 'oscuro' ? 'claro' : 'oscuro';
    this.aplicar(nuevo);
    this.tema.set(nuevo);
    try {
      localStorage.setItem(CLAVE_TEMA, nuevo);
    } catch {
    }
  }

  private aplicar(tema: Tema) {
    document.documentElement.dataset['tema'] = tema;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', tema === 'oscuro' ? '#202124' : '#604a33');
  }

  private inicial(): Tema {
    try {
      const guardado = localStorage.getItem(CLAVE_TEMA);
      if (guardado === 'claro' || guardado === 'oscuro') return guardado;
    } catch {
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }
}
