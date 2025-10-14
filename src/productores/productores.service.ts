import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductorDto } from './dto/create-productor.dto';
import { UpdateProductorDto } from './dto/update-productor.dto';
import { AuditoriaService } from 'src/auditoria/auditoria.service';

@Injectable()
export class ProductoresService {
    constructor(private prisma: PrismaService, private readonly auditoria: AuditoriaService) { }

    async create(createRolDto: CreateProductorDto, actorId: number) {
        const productor = await this.prisma.productor.create({ data: createRolDto });

        await this.auditoria.registrarAccion({
            id_usuario: actorId,
            id_tipo_accion: 17, // CREAR_PRODUCTOR (agregar al seed)
            entidad_afectada: 'Productor',
            id_entidad: productor.id_productor,
        });
    }

    // Listar todas
    async findAll() {
        return this.prisma.productor.findMany();
    }

    async findOne(id: number) {
        const productor = await this.prisma.productor.findUnique({ where: { id_productor: id }, });
        if (!productor) throw new NotFoundException(`Productor ${id} no encontrado`);
        return productor;
    }

    async update(id: number, updateProductorDto: UpdateProductorDto, actorId: number) {
        const productorExistente = await this.prisma.productor.findUnique({ where: { id_productor: id } });
        if (!productorExistente) throw new NotFoundException('Productor no encontrado');

        const productorActualizado = await this.prisma.productor.update({
            where: { id_productor: id },
            data: updateProductorDto,
        });

        await this.auditoria.registrarAccion({
            id_usuario: actorId,
            id_tipo_accion: 18, // ACTUALIZAR_PRODUCTOR (agregar al seed)
            entidad_afectada: 'Productor',
            id_entidad: id,
        });

        return productorActualizado;
    }


    async softDelete(id: number, actorId: number) {
        const productorInactivo = await this.prisma.productor.update({
            where: { id_productor: id },
            data: { estado: false },
        });

        await this.auditoria.registrarAccion({
            id_usuario: actorId,
            id_tipo_accion: 19,
            entidad_afectada: 'Productor',
            id_entidad: id,
        });
        return productorInactivo;
    }

    async hardDelete(id: number, actorId: number) {
        await this.prisma.registroAcciones.deleteMany({ where: { entidad_afectada: 'Productor', id_entidad: id } });
        await this.prisma.productor.delete({ where: { id_productor: id } });

        await this.auditoria.registrarAccion({
            id_usuario: actorId,
            id_tipo_accion: 19,
            entidad_afectada: 'Productor',
            id_entidad: id,
        });
        return { message: 'Productor eliminado permanentemente' };
    }


}