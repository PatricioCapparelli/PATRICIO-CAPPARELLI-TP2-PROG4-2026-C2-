import { IsIn } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto';

export class CreateUsuarioDto extends RegistroDto {
  @IsIn(['usuario', 'administrador'], {
    message: "El perfil debe ser 'usuario' o 'administrador'",
  })
  perfil: string;
}
