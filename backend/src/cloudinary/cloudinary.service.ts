import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor(config: ConfigService) {
        cloudinary.config({
            cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
            api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async subirImagen(archivo: Express.Multer.File, carpeta: string): Promise<string> {
        const base64 = archivo.buffer.toString('base64');
        const uri = `data:${archivo.mimetype};base64,${base64}`;

        try {
            const resultado = await cloudinary.uploader.upload(uri, {
                folder: carpeta,
                public_id: `${Date.now()}`,
            });
            return resultado.secure_url;
        } catch {
            throw new InternalServerErrorException('No se pudo subir la imagen. Intentá nuevamente.');
        }
    }
}