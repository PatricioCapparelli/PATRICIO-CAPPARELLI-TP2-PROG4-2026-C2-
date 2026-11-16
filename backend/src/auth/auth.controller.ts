import {
  BadRequestException, Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { Res } from '@nestjs/common';
import type { Response } from 'express';
import { opcionesBorrado, opcionesCookie } from './cookie.config';
import { UseGuards } from '@nestjs/common';
import { TokenGuard } from './token/token.guard';
import { UsuarioActual } from './token/usuario-actual.decorator';
import type { UsuarioToken } from './token/usuario-actual.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('registro')
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
  async registro(
    @Body() dto: RegistroDto,
    @Res({ passthrough: true }) res: Response,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const { access_token, usuario } = await this.authService.registro(dto, file);
    res.cookie('token', access_token, opcionesCookie());
    return { usuario };
  }
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, usuario } = await this.authService.login(dto);
    res.cookie('token', access_token, opcionesCookie());
    return { usuario };
  }
  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', opcionesBorrado());
  }
  @Post('autorizar')
  @HttpCode(200)
  @UseGuards(TokenGuard)
  autorizar(@UsuarioActual() usuario: UsuarioToken) {
    return this.authService.autorizar(usuario);
  }
  @Post('refrescar')
  @HttpCode(200)
  @UseGuards(TokenGuard)
  refrescar(
    @UsuarioActual() usuario: UsuarioToken,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = this.authService.refrescar(usuario);
    res.cookie('token', token, opcionesCookie());
    return { mensaje: 'Sesión extendida por 15 minutos más' };
  }
}
