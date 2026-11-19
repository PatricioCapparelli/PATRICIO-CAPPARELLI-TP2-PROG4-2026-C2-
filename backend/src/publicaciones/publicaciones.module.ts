import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Usuario, UsuarioSchema } from '../usuarios/entities/usuario.entity';
import { ComentariosController } from './comentarios/comentarios.controller';
import { ComentariosService } from './comentarios/comentarios.service';
import { Comentario, ComentarioSchema } from './comentarios/entities/comentario.entity';
import { Publicacion, PublicacionSchema } from './entities/publicacion.entity';
import { EstadisticasController } from './estadisticas/estadisticas.controller';
import { EstadisticasService } from './estadisticas/estadisticas.service';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [PublicacionesController, ComentariosController, EstadisticasController],
  providers: [PublicacionesService, ComentariosService, EstadisticasService],
})
export class PublicacionesModule {}
