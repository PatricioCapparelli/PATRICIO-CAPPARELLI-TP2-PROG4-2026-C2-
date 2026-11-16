import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isObjectIdOrHexString } from 'mongoose';
import { Publicacion, PublicacionDocument } from '../entities/publicacion.entity';
import type { AutorResumen } from '../publicaciones.service';
import { ComentarioDto } from './dto/comentario.dto';
import { Comentario, ComentarioDocument } from './entities/comentario.entity';

const CAMPOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

export interface ComentarioPoblado {
  _id: Types.ObjectId;
  publicacion: Types.ObjectId;
  autor: AutorResumen;
  mensaje: string;
  modificado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly model: Model<ComentarioDocument>,
    @InjectModel(Publicacion.name)
    private readonly publicaciones: Model<PublicacionDocument>,
  ) {}

  async listar(publicacionId: string, offset: number, limit: number) {
    await this.asegurarPublicacion(publicacionId);
    const filtro = { publicacion: new Types.ObjectId(publicacionId) };

    const [items, total] = await Promise.all([
      this.model
        .find(filtro)
        .sort({ createdAt: -1, _id: -1 })
        .skip(offset)
        .limit(limit)
        .populate('autor', CAMPOS_AUTOR)
        .lean<ComentarioPoblado[]>(),
      this.model.countDocuments(filtro),
    ]);

    return { items, total, offset, limit };
  }

  async crear(publicacionId: string, dto: ComentarioDto, autorId: string) {
    await this.asegurarPublicacion(publicacionId);
    const creado = await this.model.create({
      publicacion: new Types.ObjectId(publicacionId),
      autor: new Types.ObjectId(autorId),
      mensaje: dto.mensaje,
    });
    return this.buscarPoblado(creado._id);
  }

  async modificar(
    publicacionId: string,
    comentarioId: string,
    dto: ComentarioDto,
    usuarioId: string,
  ) {
    await this.asegurarPublicacion(publicacionId);
    if (!isObjectIdOrHexString(comentarioId)) {
      throw new NotFoundException('El comentario no existe');
    }

    const comentario = await this.model.findOne({
      _id: comentarioId,
      publicacion: publicacionId,
    });
    if (!comentario) throw new NotFoundException('El comentario no existe');

    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;
    await comentario.save();

    return this.buscarPoblado(comentario._id);
  }

  private async buscarPoblado(id: Types.ObjectId) {
    const comentario = await this.model
      .findById(id)
      .populate('autor', CAMPOS_AUTOR)
      .lean<ComentarioPoblado>();
    if (!comentario) throw new NotFoundException('El comentario no existe');
    return comentario;
  }

  private async asegurarPublicacion(id: string) {
    if (!isObjectIdOrHexString(id)) {
      throw new NotFoundException('La publicación no existe');
    }
    const existe = await this.publicaciones.exists({ _id: id, activa: true });
    if (!existe) throw new NotFoundException('La publicación no existe');
  }
}
