import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<UsuarioDocument>,
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
}
