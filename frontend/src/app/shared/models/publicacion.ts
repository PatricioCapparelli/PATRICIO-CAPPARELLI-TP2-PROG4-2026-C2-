export interface AutorResumen {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  imagenPerfil?: string;
}

export interface Comentario {
  _id: string;
  mensaje: string;
  modificado: boolean;
  autor: AutorResumen;
  createdAt: string;
}

export interface PaginaComentarios {
  items: Comentario[];
  total: number;
  offset: number;
  limit: number;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  descripcion: string;
  imagen?: string;
  autor: AutorResumen;
  cantidadMeGusta: number;
  meGustaMio: boolean;
  createdAt: string;
  comentarios?: Comentario[];
}

export interface PaginaPublicaciones {
  items: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}

export interface EstadoMeGusta {
  cantidadMeGusta: number;
  meGustaMio: boolean;
}

export type Orden = 'fecha' | 'meGusta';
