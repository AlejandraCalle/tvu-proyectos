import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { AuditoriaService } from 'src/auditoria/auditoria.service';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService, private readonly auditoria: AuditoriaService) { }

  // Generar código único TVU-AAAA-MM-DD-CAT
  // D:\TVU-MediaFinder\src\videos\videos.service.ts

  private async generarCodigoUnico(id_categoria: number): Promise<string> {
    const categoria = await this.prisma.categoria.findUnique({ where: { id_categoria } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');

    const inicialCategoria = categoria.nombre_categoria.charAt(0).toUpperCase();

    // 1. Crear el prefijo de fecha (YYYYMMDD)
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const fechaFormateada = `${año}${mes}${dia}`;

    // 2. Definir el prefijo base del código único
    const prefijoBase = `TVU-${fechaFormateada}-${inicialCategoria}`;

    // 3. Contar cuántos videos ya existen con este prefijo (para obtener el sufijo consecutivo)
    const count = await this.prisma.video.count({
      where: {
        código_único: {
          startsWith: prefijoBase,
        },
      },
    });

    // 4. Calcular el siguiente número consecutivo
    const siguienteConsecutivo = count + 1;

    // 5. Formatear el sufijo (añadir ceros a la izquierda, ej: 1 -> 001)
    // Usaremos 3 dígitos para el consecutivo (hasta 999 videos por día por categoría)
    const sufijo = String(siguienteConsecutivo).padStart(3, '0');

    // 6. Devolver el código único final
    return `${prefijoBase}-${sufijo}`;
  }

  // Crear video
  async create(createVideoDto: CreateVideoDto, id_actor: number) {
    const codigoUnico = await this.generarCodigoUnico(createVideoDto.id_categoria);

    const nuevoVideo = await this.prisma.video.create({
      data: {
        código_único: codigoUnico,
        titulo: createVideoDto.titulo,
        descripcion: createVideoDto.descripcion,
        id_productor: createVideoDto.id_productor,
        id_categoria: createVideoDto.id_categoria,
      },
      include: { productor: true, categoria: true },
    });

    // Registro de acción global
    await this.auditoria.registrarAccion({
      id_usuario: id_actor,
      id_tipo_accion: 11, // CREAR_VIDEO (agregar en tu seed si no está)
      entidad_afectada: 'Video',
      id_entidad: nuevoVideo.id_video,
    });

    return nuevoVideo;
  }

  // Convertir fecha a hora local de La Paz
  private convertirFechaLocal(fecha: Date): string {
    return fecha.toLocaleString('es-BO', { timeZone: 'America/La_Paz' });
  }

  // Listar todos los videos
  async findAll() {
    const videos = await this.prisma.video.findMany({
      include: {
        productor: true,
        categoria: true,
        videoEtiquetas: { include: { etiqueta: true } },
      },
    });

    return videos.map((v) => ({
      ...v,
      fecha_creación: this.convertirFechaLocal(v.fecha_creación),
    }));
  }

  async findAllEtiquetas() {
    return this.prisma.etiqueta.findMany({
      orderBy: { nombre_etiqueta: 'asc' }
    })
  }

  // Obtener un video por ID
  async findOne(id: number) {
    const video = await this.prisma.video.findUnique({
      where: { id_video: id },
      include: {
        productor: true,
        categoria: true,
        videoEtiquetas: { include: { etiqueta: true } },
      },
    });

    if (!video) throw new NotFoundException('Video no encontrado');
    return {
      ...video,
      fecha_creación: this.convertirFechaLocal(video.fecha_creación),
    };
  }


  // Actualizar video con registro de historial específico
  async update(id: number, updateVideoDto: UpdateVideoDto, id_usuario: number) {
    // Obtener el video antes de actualizarlo
    const videoExistente = await this.prisma.video.findUnique({
      where: { id_video: id },
      include: { categoria: true, productor: true },
    });
    if (!videoExistente) throw new NotFoundException('Video no encontrado');

    if (videoExistente.estado === false) {
      throw new ForbiddenException('No se permite actualizar un video inactivo o eliminado.');
    }

    // Actualizar el video
    const videoActualizado = await this.prisma.video.update({
      where: { id_video: id },
      data: updateVideoDto,
      include: {
        productor: true,
        categoria: true,
        videoEtiquetas: { include: { etiqueta: true } },
      },
    });

    // Mapear campos a sus IDs de TipoCambio
    const camposACambios = {
      titulo: 100,       // ACTUALIZAR_TITULO
      descripcion: 101,  // ACTUALIZAR_DESCRIPCION
      id_productor: 102, // ACTUALIZAR_PRODUCTOR
      id_categoria: 103, // ACTUALIZAR_CATEGORIA
    };

    // Registrar cambios específicos en HistorialCambios
    for (const campo in camposACambios) {
      const antes = videoExistente[campo];
      const despues = videoActualizado[campo];
      if (antes !== despues) {
        await this.prisma.historialCambios.create({
          data: {
            id_video: id,
            id_usuario,
            id_tipo_cambio: camposACambios[campo],
            fecha_cambio: new Date(),
            detalle_cambio: `${campo}: "${antes}" -> "${despues}"`,
          },
        });
      }
    }

    // Registrar acción global del usuario
    await this.prisma.registroAcciones.create({
      data: {
        id_usuario,
        id_tipo_accion: 12, // ACTUALIZAR_VIDEO
        entidad_afectada: 'Video',
        id_entidad: id,
        fecha_accion: new Date(),
      },
    });

    return videoActualizado;
  }

  // Eliminar video
  async softDelete(idVideo: number, actorId: number) {
    const videoInactivo = await this.prisma.video.update({
      where: { id_video: idVideo },
      data: { estado: false },
    });

    await this.auditoria.registrarAccion({
      id_usuario: actorId,
      id_tipo_accion: 13, // ELIMINAR_VIDEO
      entidad_afectada: 'Video',
      id_entidad: idVideo,
    });
  }

  async hardDelete(idVideo: number, id_actor: number) {
    await this.prisma.registroAcciones.deleteMany({ where: { entidad_afectada: 'Video', id_entidad: idVideo } });
    await this.prisma.historialCambios.deleteMany({ where: { id_video: idVideo } });
    await this.prisma.asignacionVideoEtiqueta.deleteMany({ where: { id_video: idVideo } });
    await this.prisma.video_Etiqueta.deleteMany({ where: { id_video: idVideo } })

    await this.prisma.video.delete({ where: { id_video: idVideo } });

    await this.auditoria.registrarAccion({
      id_usuario: id_actor,
      id_tipo_accion: 13, // ELIMINAR_USUARIO
      entidad_afectada: 'Video',
      id_entidad: idVideo,
    });

    return { message: 'Usuario eliminado permanentemente' };
  }

  // Asignar etiquetas a un video
  async updateEtiquetas(idVideo: number, nuevasEtiquetas: number[], actorId: number) {
    const videoExistente = await this.prisma.video.findUnique({
      where: { id_video: idVideo },
      select: { estado: true }
    });

    if (!videoExistente) {
      throw new NotFoundException('Video no encontrado');
    }

    if (videoExistente.estado === false) {
    }

    // 1. Obtener las etiquetas actuales del video
    const actuales = await this.prisma.video_Etiqueta.findMany({
      where: { id_video: idVideo },
      select: { id_etiqueta: true }
    });
    const etiquetasOriginales = actuales.map(e => e.id_etiqueta);
    // 2. Calcular diferencias
    const etiquetasAgregar = nuevasEtiquetas.filter(e => !etiquetasOriginales.includes(e));
    const etiquetasQuitar = etiquetasOriginales.filter(e => !nuevasEtiquetas.includes(e));
    const fecha = new Date();
    // 3. Agregar nuevas etiquetas
    if (etiquetasAgregar.length > 0) {
      await this.prisma.video_Etiqueta.createMany({
        data: etiquetasAgregar.map(idEtiqueta => ({
          id_video: idVideo,
          id_etiqueta: idEtiqueta,
          fecha_asignacion: new Date(),
        }))
      });
      // Auditoría → registro en AsignacionVideoEtiqueta
      for (const idEtiqueta of etiquetasAgregar) {
        await this.prisma.asignacionVideoEtiqueta.create({
          data: {
            id_video: idVideo,
            id_etiqueta: idEtiqueta,
            asignado_por: actorId,
            fecha_asignacion: fecha,
            accion: 'ASIGNAR'
          }
        });
      }

      await this.prisma.historialCambios.create({
        data: {
          id_video: idVideo,
          id_usuario: actorId,
          id_tipo_cambio: 104, // ASIGNAR_ETIQUETA
          fecha_cambio: new Date(),
          detalle_cambio: `Etiquetas asignadas: [${etiquetasAgregar.join(', ')}]`,
        },
      });

    }
    // 4. Quitar etiquetas
    if (etiquetasQuitar.length > 0) {
      await this.prisma.video_Etiqueta.deleteMany({
        where: {
          id_video: idVideo,
          id_etiqueta: { in: etiquetasQuitar }
        }
      });
      // Auditoría → registro también en AsignacionVideoEtiqueta
      for (const idEtiqueta of etiquetasQuitar) {
        await this.prisma.asignacionVideoEtiqueta.create({
          data: {
            id_video: idVideo,
            id_etiqueta: idEtiqueta,
            asignado_por: actorId,
            fecha_asignacion: fecha,
            accion: 'QUITAR'
          }
        });
      }
      await this.prisma.historialCambios.create({
        data: {
          id_video: idVideo,
          id_usuario: actorId,
          id_tipo_cambio: 105, // REMOVER_ETIQUETA
          fecha_cambio: new Date(),
          detalle_cambio: `Etiquetas removidas: [${etiquetasQuitar.join(', ')}]`,
        },
      });
    }
    return { mensaje: 'Etiquetas actualizadas correctamente' };
  }

  async finEtiquetasByVideo(id_video: number) {
    const video = await this.prisma.video.findUnique({
      where: { id_video },
      include: {
        videoEtiquetas: {
          include: { etiqueta: true },
        },
      },
    });
    if (!video) return [];
    return video.videoEtiquetas.map((ve) => ve.etiqueta);
  }
}
