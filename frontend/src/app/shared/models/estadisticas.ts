export interface PublicacionPorUsuario {
  usuarioId: string;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  cantidad: number;
}

export interface ComentarioPorDia {
  fecha: string; 
  cantidad: number;
}

export interface ComentarioPorPublicacion {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}
