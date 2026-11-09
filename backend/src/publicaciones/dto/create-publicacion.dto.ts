import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  descripcion: string;
}
