import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { RequestConUsuario } from './request-con-usuario.interface';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestConUsuario>();
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException('Token no proporcionado');

    try {
      req.user = jwt.verify(token, this.config.getOrThrow<string>('JWT_SECRET'));
      return true;
    } catch {
      throw new UnauthorizedException('Token no válido o expirado');
    }
  }
}
