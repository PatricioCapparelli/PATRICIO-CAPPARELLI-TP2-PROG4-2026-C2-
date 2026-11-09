import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true, index: true })
  autor: Types.ObjectId;
  @Prop({ required: true }) titulo: string;
  @Prop({ required: true }) descripcion: string;
  @Prop() imagen?: string; 
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  meGusta: Types.ObjectId[];
  @Prop({ default: 0, index: true }) cantidadMeGusta: number;
  @Prop({ default: true, index: true }) activa: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
