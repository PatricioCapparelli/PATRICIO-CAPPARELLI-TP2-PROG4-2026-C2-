import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { unlink } from 'fs/promises';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: diskStorage({
        destination: './uploads/perfiles',
        filename: (_req, file, cb) =>
          cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('El archivo debe ser una imagen'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    }),
  )
  async registro(
    @Body() dto: RegistroDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagen = file ? `/uploads/perfiles/${file.filename}` : undefined;
    try {
      return await this.authService.registro(dto, imagen);
    } catch (error) {
      // si el registro falla, no dejamos la imagen huérfana en disco
      if (file) await unlink(file.path).catch(() => undefined);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
