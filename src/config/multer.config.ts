// src/config/multer.config.ts
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

// Directorio donde se guardarán los videos
export const UPLOAD_DIR = join(process.cwd(), 'uploads', 'videos');

// Crear el directorio si no existe
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuración de Multer
export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      // Generar nombre único: timestamp-random-originalname
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      const filename = `video-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Solo permitir archivos de video
    const allowedMimeTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'video/webm',
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Solo se permiten archivos de video (MP4, AVI, MOV, MKV, WebM)'), false);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // Límite de 500 MB
  },
};