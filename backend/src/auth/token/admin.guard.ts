import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RequestConUsuario } from './request-con-usuario.interface';
import type { UsuarioToken } from './usuario-actual.decorator';

// Se usa DESPUÉS de TokenGuard: @UseGuards(TokenGuard, AdminGuard)
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestConUsuario>();
    const usuario = req.user as unknown as UsuarioToken | undefined;

    if (usuario?.perfil !== 'administrador') {
      throw new ForbiddenException('Solo los administradores pueden realizar esta acción');
    }
    return true;
  }
}
