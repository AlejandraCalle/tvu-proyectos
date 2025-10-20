// src/busqueda/busqueda.service.ts
import {Injectable, BadRequestException, InternalServerErrorException} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { SearchVideoDto } from './dto/search-video.dto'

@Injectable()
export class BusquedaService {
  constructor(private prisma: PrismaService) { }

  private crearFechaUTC(fechaStr: string): Date {
    return new Date(`${fechaStr}T00:00:00.000Z`);
  }

  // 📌 UTILIDADES DE FECHA
  private ajustarFechaInicio(fecha: Date): Date {
    return fecha;
  }


  private ajustarFechaFin(fecha: Date): Date {
    const f = new Date(fecha)
    f.setUTCMilliseconds(f.getUTCMilliseconds() + (24 * 60 * 60 * 1000) - 1);
    return f
  }

  // 🔹 BÚSQUEDA AVANZADA
  async buscarVideos(filtros: SearchVideoDto) {
    const {
      titulo,
      descripcion,
      fechaInicio,
      fechaFin,
      id_categoria,
      id_productor,
      etiquetas,
    } = filtros

    // Validación de rango de fechas (solo si ambas están presentes)
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      throw new BadRequestException('La fecha de inicio no puede ser mayor que la fecha fin')
    }

    let fechaInicioUTC: Date | undefined
    let fechaFinUTC: Date | undefined

    if (fechaInicio) fechaInicioUTC = this.ajustarFechaInicio(this.crearFechaUTC(fechaInicio))
    if (fechaFin) fechaFinUTC = this.ajustarFechaFin(this.crearFechaUTC(fechaFin))
    try {
      const whereConditions: any[] = []
      if (titulo) {
        whereConditions.push({
          titulo: { contains: titulo, mode: 'insensitive' },
        })
      }

      if (descripcion) {
        whereConditions.push({
          descripcion: { contains: descripcion, mode: 'insensitive' },
        })
      }

      if (fechaInicioUTC || fechaFinUTC) {
        const rango: any = {}
        if (fechaInicioUTC) rango.gte = fechaInicioUTC
        if (fechaFinUTC) rango.lte = fechaFinUTC
        whereConditions.push({ fecha_creación: rango })
      }

      if (id_categoria) {
        whereConditions.push({
          id_categoria,
        })
      }

      if (id_productor) {
        whereConditions.push({
          id_productor,
        })
      }

      if (etiquetas && etiquetas.length > 0) {
        whereConditions.push({
          videoEtiquetas: {
            some: {
              id_etiqueta: { in: etiquetas },
            },
          },
        })
      }

      // Si no hay condiciones, buscar todos
      const where =
        whereConditions.length > 0
          ? {
            AND: whereConditions,
          }
          : {}

      const resultados = await this.prisma.video.findMany({
        where,
        include: {
          categoria: true,
          productor: true,
          videoEtiquetas: { include: { etiqueta: true } },
        },
        orderBy: {
          fecha_creación: 'desc',
        },
      })

      // Si no hay resultados → devolver arreglo vacío
      return resultados.length > 0 ? resultados : []
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error)
      throw new InternalServerErrorException(
        'Error al ejecutar la búsqueda, intenta nuevamente.',
      )
    }
  }

  // 🔍 BÚSQUEDA PROFUNDA (global)
  async busquedaProfunda(termino: string) {
    if (!termino || termino.trim() === '') {
      throw new BadRequestException('Debe proporcionar un término de búsqueda.')
    }

    try {
      const resultados = await this.prisma.video.findMany({
        where: {
          OR: [
            { titulo: { contains: termino, mode: 'insensitive' } },
            { descripcion: { contains: termino, mode: 'insensitive' } },
            {
              categoria: {
                nombre_categoria: {
                  contains: termino,
                  mode: 'insensitive',
                },
              },
            },
            {
              productor: {
                nombre_productor: {
                  contains: termino,
                  mode: 'insensitive',
                },
              },
            },
            {
              videoEtiquetas: {
                some: {
                  etiqueta: {
                    nombre_etiqueta: {
                      contains: termino,
                      mode: 'insensitive',
                    },
                  },
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
        orderBy: {
          fecha_creación: 'desc',
        },
      })

      return resultados.length > 0 ? resultados : []
    } catch (error) {
      console.error('Error en búsqueda profunda:', error)
      throw new InternalServerErrorException(
        'Error al ejecutar la búsqueda profunda.',
      )
    }
  }
}