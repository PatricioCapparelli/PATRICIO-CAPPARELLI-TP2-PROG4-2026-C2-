import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly config: ConfigService,
  ) {}

  async registro(dto: RegistroDto, imagenPerfil?: string) {
    // 1. Revisar que el usuario no exista
    if (await this.usuariosService.existe(dto.correo, dto.nombreUsuario)) {
      throw new ConflictException(
        'El correo o el nombre de usuario ya están registrados',
      );
    }

    // 2. Encriptar la contraseña y guardar en la DB
    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.usuariosService.crear({
      ...dto,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      password: hash,
      imagenPerfil,
    });

    // 3. Devolver token y datos del usuario
    return {
      access_token: this.generarToken(usuario),
      usuario: this.sinPassword(usuario),
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarPorCorreoOUsuario(
      dto.identificador,
    );

    if (!usuario || !(await bcrypt.compare(dto.password, usuario.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      access_token: this.generarToken(usuario),
      usuario: this.sinPassword(usuario),
    };
  }

  generarToken(usuario: UsuarioDocument) {
    const payload = {
      user: usuario.nombreUsuario,
      id: usuario._id.toString(),
      perfil: usuario.perfil,
    };

    return jwt.sign(payload, this.config.getOrThrow<string>('JWT_SECRET'), {
      issuer: 'MI SERVER',
      expiresIn: '1d',
    });
  }

  private sinPassword(usuario: UsuarioDocument) {
    const { password: _password, ...resto } = usuario.toObject();
    return resto;
  }
}
