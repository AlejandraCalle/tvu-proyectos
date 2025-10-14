import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchVideoDto } from './dto/search-video.dto';

@Injectable()
export class BusquedaService {
  constructor(private prisma: PrismaService) { }

  // 📌 UTILIDADES DE FECHA
  private ajustarFechaInicio(fecha: Date): Date {
    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);
    return f;
  }

  private ajustarFechaFin(fecha: Date): Date {
    const f = new Date(fecha);
    f.setHours(23, 59, 59, 999);
    return f;
  }

  // 🔹 BÚSQUEDA AVANZADA
  async buscarVideos(filtros: SearchVideoDto) {
    const { titulo, descripcion, fechaInicio, fechaFin, id_categoria, id_productor, etiquetas } = filtros;

    // Validación de rango de fechas
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      throw new BadRequestException('La fecha de inicio no puede ser mayor que la fecha fin');
    }

    let fechaInicioUTC: Date | undefined;
    let fechaFinUTC: Date | undefined;

    if (fechaInicio) fechaInicioUTC = this.ajustarFechaInicio(new Date(fechaInicio));
    if (fechaFin) fechaFinUTC = this.ajustarFechaFin(new Date(fechaFin));

    try {
      const resultados = await this.prisma.video.findMany({
        where: {
          AND: [
            titulo ? { titulo: { contains: titulo, mode: 'insensitive' } } : {},
            descripcion ? { descripcion: { contains: descripcion, mode: 'insensitive' } } : {},
            fechaInicioUTC && fechaFinUTC ? { fecha_creación: { gte: fechaInicioUTC, lte: fechaFinUTC } } : {},
            id_categoria ? { id_categoria } : {},
            id_productor ? { id_productor } : {},
            etiquetas && etiquetas.length > 0
              ? { videoEtiquetas: { some: { id_etiqueta: { in: etiquetas } } } }
              : {},
          ],
        },
        include: {
          categoria: true,
          productor: true,
          videoEtiquetas: { include: { etiqueta: true } },
        },
      });

      // Si no hay resultados → devolver arreglo vacío
      return resultados.length > 0 ? resultados : [];
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      throw new InternalServerErrorException('Error al ejecutar la búsqueda, intenta nuevamente.');
    }
  }


  // 🔍 BÚSQUEDA PROFUNDA (global)
async busquedaProfunda(termino: string) {
  if (!termino || termino.trim() === '') {
    throw new BadRequestException('Debe proporcionar un término de búsqueda.');
  }

  try {
    const resultados = await this.prisma.video.findMany({
      where: {
        OR: [
          { titulo: { contains: termino, mode: 'insensitive' } },
          { descripcion: { contains: termino, mode: 'insensitive' } },
          {
            categoria: {
              nombre_categoria: { contains: termino, mode: 'insensitive' },
            },
          },
          {
            productor: {
              nombre_productor: { contains: termino, mode: 'insensitive' },
            },
          },
          {
            videoEtiquetas: {
              some: {
                etiqueta: { nombre_etiqueta: { contains: termino, mode: 'insensitive' } },
              },
            },
          },
        ],
      },
      include: {
        categoria: true,
        productor: true,
        videoEtiquetas: { include: { etiqueta: true } },
      },
    });

    return resultados.length > 0 ? resultados : [];
  } catch (error) {
    console.error('Error en búsqueda profunda:', error);
    throw new InternalServerErrorException('Error al ejecutar la búsqueda profunda.');
  }
}


}
