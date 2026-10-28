import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true }) nombre: string;
  @Prop({ required: true }) apellido: string;
  @Prop({ required: true, unique: true, lowercase: true }) correo: string;
  @Prop({ required: true, unique: true }) nombreUsuario: string;
  @Prop({ required: true }) password: string; // hash bcrypt
  @Prop({ required: true }) fechaNacimiento: Date;
  @Prop() descripcion?: string;
  @Prop() imagenPerfil?: string; // ruta de la imagen
  @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' }) perfil: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
