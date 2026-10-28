import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegistroDto {
  @IsNotEmpty() nombre: string;
  @IsNotEmpty() apellido: string;
  @IsEmail() correo: string;
  @IsNotEmpty() nombreUsuario: string;
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  password: string;
  @IsDateString() fechaNacimiento: string;
  @IsOptional() @MaxLength(200) descripcion?: string;
}
