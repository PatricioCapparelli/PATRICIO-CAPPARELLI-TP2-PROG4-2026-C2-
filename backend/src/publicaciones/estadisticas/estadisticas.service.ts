import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Usuario, UsuarioDocument } from '../../usuarios/entities/usuario.entity';
import { Comentario, ComentarioDocument } from '../comentarios/entities/comentario.entity';
import { Publicacion, PublicacionDocument } from '../entities/publicacion.entity';

const ZONA = 'America/Argentina/Buenos_Aires';
const MAX_DIAS = 366;

// Solo cuentan las publicaciones activas y los comentarios de publicaciones activas
@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicaciones: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private readonly comentarios: Model<ComentarioDocument>,
    @InjectModel(Usuario.name) private readonly usuarios: Model<UsuarioDocument>,
  ) {}

  // Gráfico de barras: publicaciones de cada usuario en el lapso
  async publicacionesPorUsuario(desde?: string, hasta?: string) {
    const { inicio, fin } = this.rango(desde, hasta);

    const grupos = await this.publicaciones.aggregate<{ _id: Types.ObjectId; cantidad: number }>([
      { $match: { activa: true, createdAt: { $gte: inicio, $lte: fin } } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1, _id: 1 } },
    ]);

    const autores = await this.usuarios
      .find({ _id: { $in: grupos.map((g) => g._id) } })
      .select('nombre apellido nombreUsuario')
      .lean<{ _id: Types.ObjectId; nombre: string; apellido: string; nombreUsuario: string }[]>();
    const porId = new Map(autores.map((a) => [a._id.toString(), a]));

    return grupos.map((g) => {
      const autor = porId.get(g._id.toString());
      return {
        usuarioId: g._id.toString(),
        nombreUsuario: autor?.nombreUsuario ?? 'desconocido',
        nombre: autor?.nombre ?? '',
        apellido: autor?.apellido ?? '',
        cantidad: g.cantidad,
      };
    });
  }

  // Gráfico de líneas: comentarios hechos cada día del lapso (los días sin comentarios van en 0)
  async comentariosPorDia(desde?: string, hasta?: string) {
    const { inicio, fin, dias } = this.rango(desde, hasta);
    const activas = await this.idsPublicacionesActivas();

    const grupos = await this.comentarios.aggregate<{ _id: string; cantidad: number }>([
      { $match: { publicacion: { $in: activas }, createdAt: { $gte: inicio, $lte: fin } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA } },
          cantidad: { $sum: 1 },
        },
      },
    ]);

    const porDia = new Map(grupos.map((g) => [g._id, g.cantidad]));
    return dias.map((fecha) => ({ fecha, cantidad: porDia.get(fecha) ?? 0 }));
  }

  // Gráfico de torta: las publicaciones con más comentarios en el lapso
  async comentariosPorPublicacion(desde: string | undefined, hasta: string | undefined, limite: number) {
    const { inicio, fin } = this.rango(desde, hasta);
    const activas = await this.idsPublicacionesActivas();

    const grupos = await this.comentarios.aggregate<{ _id: Types.ObjectId; cantidad: number }>([
      { $match: { publicacion: { $in: activas }, createdAt: { $gte: inicio, $lte: fin } } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1, _id: 1 } },
      { $limit: limite },
    ]);

    const publicaciones = await this.publicaciones
      .find({ _id: { $in: grupos.map((g) => g._id) } })
      .select('titulo')
      .lean<{ _id: Types.ObjectId; titulo: string }[]>();
    const porId = new Map(publicaciones.map((p) => [p._id.toString(), p]));

    return grupos.map((g) => ({
      publicacionId: g._id.toString(),
      titulo: porId.get(g._id.toString())?.titulo ?? 'Sin título',
      cantidad: g.cantidad,
    }));
  }

  // ---------- auxiliares ----------

  private async idsPublicacionesActivas() {
    return (await this.publicaciones.distinct('_id', { activa: true })) as Types.ObjectId[];
  }

  // Lapso por defecto: últimos 30 días. Las fechas llegan como YYYY-MM-DD (hora argentina).
  private rango(desde?: string, hasta?: string) {
    const fin = hasta ?? this.hoy();
    const inicio = desde ?? this.sumarDias(fin, -29);

    for (const fecha of [inicio, fin]) {
      if (!this.esFechaValida(fecha)) {
        throw new BadRequestException('Las fechas deben tener el formato AAAA-MM-DD');
      }
    }
    if (inicio > fin) {
      throw new BadRequestException("La fecha 'desde' no puede ser posterior a 'hasta'");
    }

    const dias: string[] = [];
    for (let dia = inicio; dia <= fin; dia = this.sumarDias(dia, 1)) {
      dias.push(dia);
      if (dias.length > MAX_DIAS) {
        throw new BadRequestException('El lapso no puede superar un año');
      }
    }

    return {
      inicio: new Date(`${inicio}T00:00:00-03:00`),
      fin: new Date(`${fin}T23:59:59.999-03:00`),
      dias,
    };
  }

  private hoy() {
    return new Date().toLocaleDateString('en-CA', { timeZone: ZONA }); // AAAA-MM-DD
  }

  private sumarDias(fecha: string, cantidad: number) {
    const d = new Date(`${fecha}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + cantidad);
    return d.toISOString().slice(0, 10);
  }

  private esFechaValida(fecha: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
    const d = new Date(`${fecha}T00:00:00Z`);
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha;
  }
}
