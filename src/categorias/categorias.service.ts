import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) { }

  // Crear categoría con registro de acción
  async create(createCategoriaDto: CreateCategoriaDto, id_usuario: number) {
    try {
      const existing = await this.prisma.categoria.findFirst({
        where: { nombre_categoria: createCategoriaDto.nombre_categoria },
      });
      if (existing) throw new BadRequestException('La categoría ya existe');

      const nuevaCategoria = await this.prisma.categoria.create({ data: createCategoriaDto });

      await this.prisma.registroAcciones.create({
        data: {
          id_usuario,
          id_tipo_accion: 8, // CREAR_CATEGORIA (ver seed)
          entidad_afectada: 'Categoria',
          id_entidad: nuevaCategoria.id_categoria,
          fecha_accion: new Date(),
        },
      });

      return nuevaCategoria;
    } catch (error) {
      throw new BadRequestException('Error al crear la categoría');
    }
  }


  // Listar todas
  async findAll() {
    return this.prisma.categoria.findMany();
  }

  // Obtener por id
  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({ where: { id_categoria: id } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    return categoria;
  }

  // Actualizar categoría con registro de acción
  async update(id: number, updateCategoriaDto: UpdateCategoriaDto, id_usuario: number) {
    const existing = await this.prisma.categoria.findFirst({
      where: { nombre_categoria: updateCategoriaDto.nombre_categoria },
    });
    if (existing && existing.id_categoria !== id) throw new BadRequestException('Ya existe otra categoría con ese nombre');

    const categoriaActualizada = await this.prisma.categoria.update({
      where: { id_categoria: id },
      data: updateCategoriaDto,
    });

    await this.prisma.registroAcciones.create({
      data: {
        id_usuario,
        id_tipo_accion: 8, // ACTUALIZAR_CATEGORIA (agregar al seed)
        entidad_afectada: 'Categoria',
        id_entidad: id,
        fecha_accion: new Date(),
      },
    });

    return categoriaActualizada;
  }

  // Eliminar categoría con registro de acción
  async remove(id: number, id_usuario: number) {
    const categoriaExistente = await this.prisma.categoria.findUnique({ where: { id_categoria: id } });
    if (!categoriaExistente) throw new NotFoundException('Categoría no encontrada');

    const eliminada = await this.prisma.categoria.delete({ where: { id_categoria: id } });

    await this.prisma.registroAcciones.create({
      data: {
        id_usuario,
        id_tipo_accion: 10, // ELIMINAR_CATEGORIA (agregar al seed)
        entidad_afectada: 'Categoria',
        id_entidad: id,
        fecha_accion: new Date(),
      },
    });

    return eliminada;
  }
}
