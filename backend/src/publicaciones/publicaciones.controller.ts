import {
  BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get, HttpCode,
  Param, ParseIntPipe, Post, Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { unlink } from 'fs/promises';
import { extname } from 'path';
import { TokenGuard } from '../auth/token/token.guard';
import { UsuarioActual } from '../auth/token/usuario-actual.decorator';
import type { UsuarioToken } from '../auth/token/usuario-actual.decorator';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { PublicacionesService } from './publicaciones.service';

const LIMITE_MAXIMO = 50;

@Controller('publicaciones')
@UseGuards(TokenGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) { }

  @Post()
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('imagen', {
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('El archivo debe ser una imagen'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  crear(
    @Body() dto: CreatePublicacionDto,
    @UsuarioActual() usuario: UsuarioToken,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.publicacionesService.crear(dto, usuario.id, file);
  }

  @Get()
  listar(
    @UsuarioActual() usuario: UsuarioToken,
    @Query('orden') orden = 'fecha',
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('usuario') autor?: string,
  ) {
    if (orden !== 'fecha' && orden !== 'meGusta') {
      throw new BadRequestException("El parámetro orden debe ser 'fecha' o 'meGusta'");
    }
    if (offset < 0 || limit < 1) {
      throw new BadRequestException('offset debe ser 0 o mayor y limit debe ser 1 o mayor');
    }
    return this.publicacionesService.listar(
      { orden, offset, limit: Math.min(limit, LIMITE_MAXIMO), usuario: autor },
      usuario.id,
    );
  }

  @Get(':id')
  obtener(@Param('id') id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.publicacionesService.obtener(id, usuario.id);
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id') id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.publicacionesService.eliminar(id, usuario);
  }

  @Post(':id/me-gusta')
  @HttpCode(201)
  darMeGusta(@Param('id') id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.publicacionesService.darMeGusta(id, usuario.id);
  }

  @Delete(':id/me-gusta')
  @HttpCode(200)
  quitarMeGusta(@Param('id') id: string, @UsuarioActual() usuario: UsuarioToken) {
    return this.publicacionesService.quitarMeGusta(id, usuario.id);
  }
}
