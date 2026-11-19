import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/token/admin.guard';
import { TokenGuard } from '../../auth/token/token.guard';
import { EstadisticasService } from './estadisticas.service';

// Todas las rutas exigen un token válido Y que pertenezca a un administrador.
// Parámetros opcionales: ?desde=AAAA-MM-DD&hasta=AAAA-MM-DD (por defecto, los últimos 30 días)
@Controller('estadisticas')
@UseGuards(TokenGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.estadisticasService.comentariosPorDia(desde, hasta);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(
    @Query('limite', new DefaultValuePipe(8), ParseIntPipe) limite: number,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const cantidad = Math.min(Math.max(limite, 1), 20);
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta, cantidad);
  }
}
