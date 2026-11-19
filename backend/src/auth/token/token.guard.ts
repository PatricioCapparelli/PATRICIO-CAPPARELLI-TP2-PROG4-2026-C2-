import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { RequestConUsuario } from './request-con-usuario.interface';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestConUsuario>();
    const token = req.cookies?.['token'];

    if (!token) {
      throw new UnauthorizedException('Tu sesión no está iniciada. Iniciá sesión para continuar.');
    }

    let payload: JwtPayload;
    try {
      const decodificado = jwt.verify(token, this.config.getOrThrow<string>('JWT_SECRET'));
      if (typeof decodificado === 'string') throw new Error('payload inválido');
      payload = decodificado;
    } catch {
      throw new UnauthorizedException('Tu sesión expiró. Volvé a iniciar sesión.');
    }

    // La cuenta se consulta en cada petición: si un administrador la deshabilitó,
    // la sesión deja de servir enseguida y no recién cuando vence el token.
    const usuario = await this.usuariosService.buscarPorId(String(payload['id']));
    if (!usuario || usuario.activo === false) {
      throw new UnauthorizedException('Tu cuenta no está habilitada. Contactá a un administrador.');
    }

    // El perfil se toma de la base: un cambio de rol se aplica sin esperar a un nuevo login.
    req.user = { ...payload, perfil: usuario.perfil };
    return true;
  }
}
