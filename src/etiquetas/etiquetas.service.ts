import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { UpdateEtiquetaDto } from './dto/update-etiqueta.dto';

@Injectable()
export class EtiquetasService {
  constructor(private prisma: PrismaService) { }

  // Crear etiqueta
  async create(createEtiquetaDto: CreateEtiquetaDto, id_usuario: number) {
    const existing = await this.prisma.etiqueta.findFirst({
      where: { nombre_etiqueta: createEtiquetaDto.nombre_etiqueta },
    });
    if (existing) throw new BadRequestException('La etiqueta ya existe');

    const nuevaEtiqueta = await this.prisma.etiqueta.create({ data: createEtiquetaDto });

    // Registro de acción global
    await this.prisma.registroAcciones.create({
      data: {
        id_usuario,
        id_tipo_accion: 5, // CREAR_ETIQUETA (ver seed)
        entidad_afectada: 'Etiqueta',
        id_entidad: nuevaEtiqueta.id_etiqueta,
        fecha_accion: new Date(),
      },
    });

    return nuevaEtiqueta;
  }

  // Listar todas
  async findAll() {
    return this.prisma.etiqueta.findMany();
  }

  // Obtener por id
  async findOne(id: number) {
    const etiqueta = await this.prisma.etiqueta.findUnique({ where: { id_etiqueta: id } });
    if (!etiqueta) throw new NotFoundException('Etiqueta no encontrada');
    return etiqueta;
  }

  // Actualizar con registro de acción
  async update(id: number, updateEtiquetaDto: UpdateEtiquetaDto, id_usuario: number) {
    const existing = await this.prisma.etiqueta.findFirst({
      where: { nombre_etiqueta: updateEtiquetaDto.nombre_etiqueta },
    });
    if (existing && existing.id_etiqueta !== id) throw new BadRequestException('Ya existe otra etiqueta con ese nombre');

    const etiquetaActualizada = await this.prisma.etiqueta.update({
      where: { id_etiqueta: id },
      data: updateEtiquetaDto,
    });

    // Registro de acción global
    await this.prisma.registroAcciones.create({
      data: {
        id_usuario,
        id_tipo_accion: 6, // ACTUALIZAR_ETIQUETA (agregar al seed)
        entidad_afectada: 'Etiqueta',
        id_entidad: id,
        fecha_accion: new Date(),
      },
    });

    return etiquetaActualizada;
  }

  // Eliminar con registro de acción
  async remove(id: number, id_usuario: number) {
    const etiquetaExistente = await this.prisma.etiqueta.findUnique({ where: { id_etiqueta: id } });
    if (!etiquetaExistente) throw new NotFoundException('Etiqueta no encontrada');

    const eliminada = await this.prisma.etiqueta.delete({ where: { id_etiqueta: id } });

    // Registro de acción global
    await this.prisma.registroAcciones.create({
      data: {
        id_usuario,
        id_tipo_accion: 7, // ELIMINAR_ETIQUETA (agregar al seed)
        entidad_afectada: 'Etiqueta',
        id_entidad: id,
        fecha_accion: new Date(),
      },
    });

    return eliminada;
  }

  async softDelete(id: number, id_usuario: number) {
    const etiquetaExistente = await this.prisma.etiqueta.findUnique({ where: { id_etiqueta: id } });
    if (!etiquetaExistente) throw new NotFoundException('Etiqueta no encontrada');
    const eliminada = await this.prisma.etiqueta.update({
      where: { id_etiqueta: id },
      data: { estado: false },
    });
    await this.prisma.registroAcciones.create({
      data: {
        id_usuario,
        id_tipo_accion: 7, // ELIMINAR_ETIQUETA
        entidad_afectada: 'Etiqueta',
        id_entidad: id,
        fecha_accion: new Date(),
      },
    });
    return eliminada;
  }

  async hardDelete(id: number, id_usuario: number) {
    const etiquetaExistente = await this.prisma.etiqueta.findUnique({ where: { id_etiqueta: id } });
    if (!etiquetaExistente) throw new NotFoundException('Etiqueta no encontrada');
    
    await this.prisma.registroAcciones.deleteMany({ where: { id_entidad: id, entidad_afectada: 'Etiqueta' } });
    await this.prisma.etiqueta.deleteMany({ where: { id_etiqueta: id } });

    await this.prisma.registroAcciones.create({
      data: {
        id_usuario,
        id_tipo_accion: 7, // ELIMINAR_ETIQUETA
        entidad_afectada: 'Etiqueta',
        id_entidad: id,
        fecha_accion: new Date(),
      },
    });
    return { message: 'Etiqueta eliminada exitosamente' };
  }

}
