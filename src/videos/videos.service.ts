import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { AssignEtiquetasDto } from './dto/assign-etiquetas.dto';
import { UnassignEtiquetasDto } from './dto/unassign-etiquetas.dto';
import { AuditoriaService } from 'src/auditoria/auditoria.service';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService, private readonly auditoria: AuditoriaService) { }

  // Generar código único TVU-AAAA-MM-DD-CAT
  private async generarCodigoUnico(id_categoria: number): Promise<string> {
    const categoria = await this.prisma.categoria.findUnique({ where: { id_categoria } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');

    const inicialCategoria = categoria.nombre_categoria.charAt(0).toUpperCase();

    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `TVU-${año}${mes}${dia}-${inicialCategoria}`;
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
  async remove(id: number, id_usuario: number) {
    const videoExistente = await this.prisma.video.findUnique({ where: { id_video: id } });
    if (!videoExistente) throw new NotFoundException('Video no encontrado');

    const eliminado = await this.prisma.video.delete({ where: { id_video: id } });

    // Registro de acción global
    await this.prisma.registroAcciones.create({
      data: {
        id_usuario,
        id_tipo_accion: 13, // ELIMINAR_VIDEO (agregar en seed)
        entidad_afectada: 'Video',
        id_entidad: id,
        fecha_accion: new Date(),
      },
    });

    return eliminado;
  }

  // Asignar etiquetas a un video
  async assignTags(assignTagsDto: AssignEtiquetasDto, id_usuario: number) {
    const { id_video, ids_etiquetas } = assignTagsDto;

    const asignaciones = await Promise.all(
      ids_etiquetas.map((id_etiqueta) =>
        this.prisma.asignacionVideoEtiqueta.create({
          data: { id_video, id_etiqueta, asignado_por: id_usuario, fecha_asignacion: new Date() },
        }),
      ),
    );

    // Historial cambio
    await this.prisma.historialCambios.create({
      data: {
        id_video,
        id_usuario,
        id_tipo_cambio: 104, // ASIGNAR_ETIQUETA
        fecha_cambio: new Date(),
        detalle_cambio: `Etiquetas asignadas: [${ids_etiquetas.join(', ')}]`,
      },
    });

    // Registro acción
    // await this.prisma.registroAcciones.create({
    //   data: {
    //     id_usuario,
    //     id_tipo_accion: 3, // ASIGNAR_ETIQUETA_A_VIDEO
    //     entidad_afectada: 'Video',
    //     id_entidad: id_video,
    //     fecha_accion: new Date(),
    //   },
    // });

    //Tener la ultima asignacion
    await Promise.all(
      ids_etiquetas.map((id_etiqueta) =>
        this.prisma.video_Etiqueta.upsert({
          where: {
            id_video_id_etiqueta: { id_video, id_etiqueta },
          },
          update: {}, // Si ya existe, no hacemos nada
          create: { id_video, id_etiqueta,fecha_asignacion:new Date() }, // Crea la relación
        }),
      ),
    );


    return asignaciones;
  }

  async unassignTags(unassignTagsDto: UnassignEtiquetasDto, id_usuario: number) {
    const { id_video, ids_etiquetas } = unassignTagsDto;

    const desasignaciones = await Promise.all(
      ids_etiquetas.map((id_etiqueta) =>
        this.prisma.asignacionVideoEtiqueta.delete({
          where: { id_video_id_etiqueta_asignado_por: { id_video, id_etiqueta, asignado_por: id_usuario } },
        }),
      ),
    );

    // Historial cambio
    await this.prisma.historialCambios.create({
      data: {
        id_video,
        id_usuario,
        id_tipo_cambio: 105, // REMOVER_ETIQUETA
        fecha_cambio: new Date(),
        detalle_cambio: `Etiquetas removidas: [${ids_etiquetas.join(', ')}]`,
      },
    });

    // Registro acción
    // await this.prisma.registroAcciones.create({
    //   data: {
    //     id_usuario,
    //     id_tipo_accion: 8, // REMOVER_ETIQUETA_VIDEO (agregar en seed)
    //     entidad_afectada: 'Video',
    //     id_entidad: id_video,
    //     fecha_accion: new Date(),
    //   },
    // });

    //Tener la ultima asignacion
    await Promise.all(
      ids_etiquetas.map((id_etiqueta) =>
        this.prisma.video_Etiqueta.delete({
          where: { id_video_id_etiqueta: { id_video, id_etiqueta } },
        }),
      ),
    );
    return desasignaciones;
  }
}
