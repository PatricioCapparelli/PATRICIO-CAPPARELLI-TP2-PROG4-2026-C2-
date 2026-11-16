import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cargando',
  templateUrl: './cargando.html',
})
export class Cargando implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const destino = this.route.snapshot.queryParamMap.get('destino');

    this.auth.autorizar().subscribe((valida) => {
      if (!valida) {
        this.router.navigate(['/login']);
        return;
      }
      const esRutaInterna = !!destino && destino.startsWith('/') && !destino.startsWith('//');
      this.router.navigateByUrl(esRutaInterna ? destino : '/publicaciones');
    });
  }
}
