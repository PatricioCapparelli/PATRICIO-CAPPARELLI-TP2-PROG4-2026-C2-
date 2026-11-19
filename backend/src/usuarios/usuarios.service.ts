import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, isObjectIdOrHexString } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario, UsuarioDocument } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  crear(data: Partial<Usuario>) {
    return this.usuarioModel.create(data);
  }

  buscarPorId(id: string) {
    return this.usuarioModel.findById(id);
  }

  buscarPorCorreoOUsuario(identificador: string) {
    return this.usuarioModel.findOne({
      $or: [{ correo: identificador.toLowerCase() }, { nombreUsuario: identificador }],
    });
  }

  existe(correo: string, nombreUsuario: string) {
    return this.usuarioModel.exists({
      $or: [{ correo: correo.toLowerCase() }, { nombreUsuario }],
    });
  }

  async listar() {
    return this.usuarioModel.find().select('-password').sort({ createdAt: -1 });
  }

  async crearPorAdmin(dto: CreateUsuarioDto, archivo?: Express.Multer.File) {
    if (await this.existe(dto.correo, dto.nombreUsuario)) {
      throw new ConflictException('El correo o el nombre de usuario ya están registrados');
    }

    const imagenPerfil = archivo
      ? await this.cloudinary.subirImagen(archivo, 'remember/perfiles')
      : undefined;
    const password = await bcrypt.hash(dto.password, 10);

    const usuario = await this.crear({
      ...dto,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      password,
      imagenPerfil,
    });
    return this.sinPassword(usuario);
  }

  async deshabilitar(id: string, adminId: string) {
    const usuarioId = this.validarId(id);
    if (usuarioId === adminId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }
    return this.cambiarEstado(usuarioId, false);
  }
  
  async habilitar(id: string) {
    return this.cambiarEstado(this.validarId(id), true);
  }

  private async cambiarEstado(id: string, activo: boolean) {
    const usuario = await this.usuarioModel.findByIdAndUpdate(id, { activo }, { new: true });
    if (!usuario) throw new NotFoundException('El usuario no existe');
    return this.sinPassword(usuario);
  }

  private validarId(id: string) {
    if (!isObjectIdOrHexString(id)) throw new NotFoundException('El usuario no existe');
    return id;
  }

  private sinPassword(usuario: UsuarioDocument) {
    const { password: _password, ...resto } = usuario.toObject();
    return resto;
  }
}
