import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../auth/token/admin.guard';
import { TokenGuard } from '../auth/token/token.guard';
import { UsuarioActual } from '../auth/token/usuario-actual.decorator';
import type { UsuarioToken } from '../auth/token/usuario-actual.decorator';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(TokenGuard, AdminGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('El archivo debe ser una imagen'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, 
    }),
  )
  crear(@Body() dto: CreateUsuarioDto, @UploadedFile() file?: Express.Multer.File) {
    return this.usuariosService.crearPorAdmin(dto, file);
  }

  @Delete(':id')
  @HttpCode(200)
  deshabilitar(@Param('id') id: string, @UsuarioActual() admin: UsuarioToken) {
    return this.usuariosService.deshabilitar(id, admin.id);
  }

  @Post(':id/habilitar')
  @HttpCode(200)
  habilitar(@Param('id') id: string) {
    return this.usuariosService.habilitar(id);
  }
}
