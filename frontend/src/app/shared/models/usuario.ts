export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion?: string;
  imagenPerfil?: string;
  perfil: 'usuario' | 'administrador';
  activo?: boolean; 
  createdAt?: string;
}

export interface RespuestaAuth {
  usuario: Usuario;
}

export interface RespuestaAutorizar {
  usuario: Usuario;
  expiraEn: number;
}
