import {BadRequestException,ConflictException,ForbiddenException,Injectable,NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isObjectIdOrHexString } from 'mongoose';
import type { UsuarioToken } from '../auth/token/usuario-actual.decorator';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { Publicacion, PublicacionDocument } from './entities/publicacion.entity';

const CAMPOS_AUTOR = 'nombre apellido nombreUsuario imagenPerfil';

export interface AutorResumen {
  _id: Types.ObjectId;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil?: string;
}

export interface PublicacionPoblada {
  _id: Types.ObjectId;
  titulo: string;
  descripcion: string;
  imagen?: string;
  autor: AutorResumen;
  meGusta: Types.ObjectId[];
  cantidadMeGusta: number;
  createdAt: Date;
}

export interface FiltrosListado {
  orden: string;
  offset: number;
  limit: number;
  usuario?: string;
}

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly model: Model<PublicacionDocument>,
  ) {}

  async crear(dto: CreatePublicacionDto, autorId: string, imagen?: string) {
    const creada = await this.model.create({
      ...dto,
      autor: new Types.ObjectId(autorId),
      imagen,
    });
    const completa = await this.model
      .findById(creada._id)
      .populate('autor', CAMPOS_AUTOR)
      .lean<PublicacionPoblada>();
    if (!completa) throw new NotFoundException('La publicación no existe');
    return this.aRespuesta(completa, autorId);
  }

  async listar(filtros: FiltrosListado, usuarioId: string) {
    const filtro = filtros.usuario
      ? { activa: true, autor: new Types.ObjectId(this.validarId(filtros.usuario, 'usuario')) }
      : { activa: true };

    const orden: Record<string, 1 | -1> =
      filtros.orden === 'meGusta'
        ? { cantidadMeGusta: -1, createdAt: -1 }
        : { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.model
        .find(filtro)
        .sort(orden)
        .skip(filtros.offset)
        .limit(filtros.limit)
        .populate('autor', CAMPOS_AUTOR)
        .lean<PublicacionPoblada[]>(),
      this.model.countDocuments(filtro),
    ]);

    return {
      items: items.map((p) => this.aRespuesta(p, usuarioId)),
      total,
      offset: filtros.offset,
      limit: filtros.limit,
    };
  }

  async eliminar(id: string, usuario: UsuarioToken) {
    this.validarId(id);
    const publicacion = await this.model.findOne({ _id: id, activa: true });
    if (!publicacion) throw new NotFoundException('La publicación no existe');

    const esAutor = publicacion.autor.toString() === usuario.id;
    if (!esAutor && usuario.perfil !== 'administrador') {
      throw new ForbiddenException(
        'Solo el autor o un administrador puede eliminar la publicación',
      );
    }

    publicacion.activa = false;
    await publicacion.save();
  }

  async darMeGusta(id: string, usuarioId: string) {
    this.validarId(id);
    const uid = new Types.ObjectId(usuarioId);

    const actualizada = await this.model.findOneAndUpdate(
      { _id: id, activa: true, meGusta: { $ne: uid } },
      { $addToSet: { meGusta: uid }, $inc: { cantidadMeGusta: 1 } },
      { new: true },
    );
    if (actualizada) {
      return { cantidadMeGusta: actualizada.cantidadMeGusta, meGustaMio: true };
    }

    await this.asegurarExiste(id);
    throw new ConflictException('Ya le diste me gusta a esta publicación');
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    this.validarId(id);
    const uid = new Types.ObjectId(usuarioId);

    const actualizada = await this.model.findOneAndUpdate(
      { _id: id, activa: true, meGusta: uid },
      { $pull: { meGusta: uid }, $inc: { cantidadMeGusta: -1 } },
      { new: true },
    );
    if (actualizada) {
      return { cantidadMeGusta: actualizada.cantidadMeGusta, meGustaMio: false };
    }

    await this.asegurarExiste(id);
    throw new BadRequestException('No habías dado me gusta a esta publicación');
  }

  private aRespuesta(p: PublicacionPoblada, usuarioId: string) {
    const { meGusta, ...resto } = p;
    return {
      ...resto,
      meGustaMio: meGusta.some((id) => id.toString() === usuarioId),
    };
  }

  private validarId(id: string, campo = 'id') {
    if (!isObjectIdOrHexString(id)) {
      if (campo === 'id') throw new NotFoundException('La publicación no existe');
      throw new BadRequestException(`El parámetro ${campo} no es válido`);
    }
    return id;
  }

  private async asegurarExiste(id: string) {
    const existe = await this.model.exists({ _id: id, activa: true });
    if (!existe) throw new NotFoundException('La publicación no existe');
  }
}
