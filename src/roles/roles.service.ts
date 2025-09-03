import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermisosGuard } from 'src/auth/permisos.guard';
import { Permisos } from 'src/auth/permisos.decorator';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService, private readonly auditoria: AuditoriaService) { }

  // Crear rol con auditoría
  async create(createRolDto: CreateRolDto, actorId: number) {
    const rol = await this.prisma.rol.create({ data: createRolDto });

    await this.auditoria.registrarAccion({
      id_usuario: actorId,
      id_tipo_accion: 14, // CREAR_ROL (agregar al seed)
      entidad_afectada: 'Rol',
      id_entidad: rol.id_rol,
    });

    return rol;
  }

  async findAll() {
    return this.prisma.rol.findMany();
  }

  async findOne(id: number) {
    const rol = await this.prisma.rol.findUnique({ where: { id_rol: id } });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return rol;
  }

  // Actualizar rol con auditoría
  async update(id: number, updateRolDto: UpdateRolDto, actorId: number) {
    const rolExistente = await this.prisma.rol.findUnique({ where: { id_rol: id } });
    if (!rolExistente) throw new NotFoundException('Rol no encontrado');

    const rolActualizado = await this.prisma.rol.update({
      where: { id_rol: id },
      data: updateRolDto,
    });

    await this.auditoria.registrarAccion({
      id_usuario: actorId,
      id_tipo_accion: 15, // ACTUALIZAR_ROL (agregar al seed)
      entidad_afectada: 'Rol',
      id_entidad: id,
    });

    return rolActualizado;
  }

  // Eliminar rol con auditoría
  async remove(id: number, actorId: number) {
    const rolExistente = await this.prisma.rol.findUnique({ where: { id_rol: id } });
    if (!rolExistente) throw new NotFoundException('Rol no encontrado');

    const eliminado = await this.prisma.rol.delete({ where: { id_rol: id } });

    await this.auditoria.registrarAccion({
      id_usuario: actorId,
      id_tipo_accion: 16, // ELIMINAR_ROL (agregar al seed)
      entidad_afectada: 'Rol',
      id_entidad: id,
    });

    return eliminado;
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('ASIGNAR_PERMISO_A_ROL')
  // Asignar permiso a rol con auditoría
  async asignarPermisoARol(id_rol: number, id_permiso: number, actorId: number) {
    const asignacion = await this.prisma.asignacionRolPermiso.create({
      data: {
        id_rol,
        id_permiso,
        fecha_asignacion: new Date(),
        asignado_por: actorId,
      },
    });

    await this.auditoria.registrarAccion({
      id_usuario: actorId,
      id_tipo_accion: 4, // "ASIGNAR_PERMISO_A_ROL" (ya en seed)
      entidad_afectada: `AsignacionRolPermiso[id_rol=${id_rol},id_permiso=${id_permiso},asignado_por=${actorId}]`,
      id_entidad: id_rol,
    });

    return asignacion;
  }
}
