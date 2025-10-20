// src/recomendaciones/recomendaciones.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import * as natural from 'natural';

@Injectable()
export class RecomendacionesService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Busca videos similares a una consulta (query) o a un video específico (id_video)
     * utilizando el algoritmo TF-IDF como aproximación a k-NN (k=5).
     */
    async buscarSimilares(dto: { query?: string; id_video?: number }) {

        // 1️⃣ Obtener todos los videos con sus datos clave
        const videos = await this.prisma.video.findMany({
            where: { estado: true },
            include: {
                videoEtiquetas: {
                    include: { etiqueta: true },
                },
                categoria: true,
                productor: true,
            },
        });

        if (!videos.length) return [];

        // 2️⃣ Crear texto completo del corpus como una cadena de STEMS
        const corpus = videos.map((v) => {
            const etiquetasTexto = v.videoEtiquetas
                .map((ve) => ve.etiqueta.nombre_etiqueta)
                .join(' ');

            const categoria = v.categoria?.nombre_categoria || '';
            const productor = v.productor?.nombre_productor || '';

            const textoCompleto = `${v.titulo} ${v.descripcion || ''} ${etiquetasTexto} ${categoria} ${productor}`.toLowerCase();

            // 🛑 Solución al error: Tokenizamos y aplicamos stemming.
            // Devolvemos el texto como una cadena de solo las raíces de las palabras.
            // ¡Esto alimenta al TF-IDF correctamente!
            return natural.PorterStemmerEs.tokenizeAndStem(textoCompleto, true).join(' ');
        });

        // 3️⃣ Construir modelo TF-IDF
        // 🛑 No usamos StemmerTokenizer. TfIdf acepta las cadenas de stems directamente.
        const tfidf = new natural.TfIdf();
        corpus.forEach((texto) => tfidf.addDocument(texto));

        // 4️⃣ Determinar texto base para la consulta (queryText)
        let queryText = dto.query?.toLowerCase() || '';
        let idVideoBase = dto.id_video;

        if (idVideoBase) {
            const videoBase = videos.find((v) => v.id_video === idVideoBase);
            if (videoBase) {
                const etiquetasBase = videoBase.videoEtiquetas
                    .map((ve) => ve.etiqueta.nombre_etiqueta)
                    .join(' ');
                const categoriaBase = videoBase.categoria?.nombre_categoria || '';
                const productorBase = videoBase.productor?.nombre_productor || '';

                queryText = `${videoBase.titulo} ${videoBase.descripcion || ''} ${etiquetasBase} ${categoriaBase} ${productorBase}`.toLowerCase();
            }
        }

        if (!queryText) return [];

        // Aseguramos que el query también pase por stemming para la comparación
        const stemmedQuery = natural.PorterStemmerEs.tokenizeAndStem(queryText, true).join(' ');

        // 5️⃣ Calcular similitud TF-IDF con el query
        const resultados = videos.map((video, i) => {
            let score = 0;
            // Usamos el query con stemming
            // TfIdf internamente tokenizará esta cadena (ya stemizada) para calcular el score.
            tfidf.tfidfs(stemmedQuery, (j, val) => {
                if (i === j) score = val;
            });

            return {
                id_video: video.id_video,
                titulo: video.titulo,
                descripcion: video.descripcion,
                etiquetas: video.videoEtiquetas.map((ve) => ve.etiqueta.nombre_etiqueta),
                score,
                categoria: video.categoria
                    ? {
                        id_categoria: video.categoria.id_categoria,
                        nombre_categoria: video.categoria.nombre_categoria,
                    }
                    : null,
                productor: video.productor
                    ? {
                        id_productor: video.productor.id_productor,
                        nombre_productor: video.productor.nombre_productor,
                    }
                    : null,
            };
        });

        // 6️⃣ Ordenar de mayor a menor similitud y devolver los 5 más cercanos (k=5)
        const recomendados = resultados
            // Filtramos para NO incluir el video base
            .filter((r) => r.id_video !== idVideoBase)
            // Ordenamos de mayor a menor score (k-NN)
            .sort((a, b) => b.score - a.score)
            // Tomamos los 5 primeros (los 5 vecinos más cercanos)
            .slice(0, 5);

        return recomendados;
    }
}