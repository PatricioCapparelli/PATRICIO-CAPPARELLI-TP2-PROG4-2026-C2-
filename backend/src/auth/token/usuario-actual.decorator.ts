import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestConUsuario } from './request-con-usuario.interface';

export interface UsuarioToken {
  id: string;
  user: string;
  perfil: string;
}

// Devuelve el payload del token que dejó TokenGuard en request.user
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioToken => {
    const req = ctx.switchToHttp().getRequest<RequestConUsuario>();
    return req.user as unknown as UsuarioToken;
  },
);
