import {BadRequestException,Body,Controller,DefaultValuePipe,Get,HttpCode,Param,
  ParseIntPipe,Post,Put,Query,UseGuards,} from '@nestjs/common';
import { TokenGuard } from '../../auth/token/token.guard';
import { UsuarioActual } from '../../auth/token/usuario-actual.decorator';
import type { UsuarioToken } from '../../auth/token/usuario-actual.decorator';
import { ComentariosService } from './comentarios.service';
import { ComentarioDto } from './dto/comentario.dto';

const LIMITE_MAXIMO = 50;

@Controller('publicaciones/:publicacionId/comentarios')
@UseGuards(TokenGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get()
  listar(
    @Param('publicacionId') publicacionId: string,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    if (offset < 0 || limit < 1) {
      throw new BadRequestException('offset debe ser 0 o mayor y limit debe ser 1 o mayor');
    }
    return this.comentariosService.listar(
      publicacionId,
      offset,
      Math.min(limit, LIMITE_MAXIMO),
    );
  }

  @Post()
  @HttpCode(201)
  crear(
    @Param('publicacionId') publicacionId: string,
    @Body() dto: ComentarioDto,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.comentariosService.crear(publicacionId, dto, usuario.id);
  }

  @Put(':comentarioId')
  @HttpCode(200)
  modificar(
    @Param('publicacionId') publicacionId: string,
    @Param('comentarioId') comentarioId: string,
    @Body() dto: ComentarioDto,
    @UsuarioActual() usuario: UsuarioToken,
  ) {
    return this.comentariosService.modificar(publicacionId, comentarioId, dto, usuario.id);
  }
}
