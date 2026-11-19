import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({ selector: '[appSoloAdmin]' })
export class SoloAdmin {
  private plantilla = inject<TemplateRef<unknown>>(TemplateRef);
  private contenedor = inject(ViewContainerRef);
  private auth = inject(AuthService);
  private visible = false;

  constructor() {
    effect(() => {
      const esAdmin = this.auth.usuario()?.perfil === 'administrador';
      if (esAdmin && !this.visible) {
        this.contenedor.createEmbeddedView(this.plantilla);
        this.visible = true;
      } else if (!esAdmin && this.visible) {
        this.contenedor.clear();
        this.visible = false;
      }
    });
  }
}
