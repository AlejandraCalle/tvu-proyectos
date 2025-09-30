import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';


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
    return this.prisma.rol.findMany({
      include: { asignacionesRolPermiso: { include: { permiso: true } } },
    });
  }

  async findOne(id: number) {
    const rol = await this.prisma.rol.findUnique({
      where: { id_rol: id },
      include: {
        asignacionesRolPermiso: {
          include: { permiso: true },
        },
      },
    })

    if (!rol) throw new NotFoundException('Rol no encontrado')
    return rol
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


  // Soft delete (estado = false)
  async softDelete(id: number, actorId: number) {
    const rol = await this.prisma.rol.findUnique({ where: { id_rol: id } })
    if (!rol) throw new NotFoundException('Rol no encontrado')

    const rolInactivo = await this.prisma.rol.update({
      where: { id_rol: id },
      data: { estado: false },
    })

    // Auditoría
    await this.auditoria.registrarAccion({
      id_usuario: actorId,
      id_tipo_accion: 16, // ELIMINAR_ROL (soft delete)
      entidad_afectada: 'Rol',
      id_entidad: id,
    })

    return rolInactivo
  }

  // Hard delete (elimina registro y dependencias)
  async hardDelete(id: number, actorId: number) {
    const rol = await this.prisma.rol.findUnique({ where: { id_rol: id } })
    if (!rol) throw new NotFoundException('Rol no encontrado')

    // Elimina primero relaciones (Rol_Permiso, Usuario, etc. si aplica)
    await this.prisma.rol_Permiso.deleteMany({ where: { id_rol: id } })
    await this.prisma.asignacionRolPermiso.deleteMany({ where: { id_rol: id } })

    // Finalmente el rol
    await this.prisma.rol.delete({ where: { id_rol: id } })

    // Auditoría
    await this.auditoria.registrarAccion({
      id_usuario: actorId,
      id_tipo_accion: 16, // ELIMINAR_ROL (hard delete)
      entidad_afectada: 'Rol',
      id_entidad: id,
    })

    return { message: 'Rol eliminado permanentemente' }
  }

  // Actualizar permisos de un rol (agregar y quitar) con auditoría
  async actualizarPermisosRol(idRol: number, nuevosPermisos: number[], actorId: number) {
    // 1. Obtener los permisos actuales desde la BD
    const actuales = await this.prisma.rol_Permiso.findMany({
      where: { id_rol: idRol },
      select: { id_permiso: true }
    });

    const permisosOriginales = actuales.map(p => p.id_permiso);

    // 2. Calcular diferencias
    const permisosAgregar = nuevosPermisos.filter(p => !permisosOriginales.includes(p));
    const permisosQuitar = permisosOriginales.filter(p => !nuevosPermisos.includes(p));

    const fecha = new Date();

    // 3. Agregar nuevos permisos en Rol_Permiso
    if (permisosAgregar.length > 0) {
      await this.prisma.rol_Permiso.createMany({
        data: permisosAgregar.map(idPermiso => ({
          id_rol: idRol,
          id_permiso: idPermiso
        }))
      });

      // Auditoría → registro en AsignacionRolPermiso
      for (const idPermiso of permisosAgregar) {
        await this.prisma.asignacionRolPermiso.create({
          data: {
            id_rol: idRol,
            id_permiso: idPermiso,
            asignado_por: actorId,
            fecha_asignacion: fecha,
            accion: 'ASIGNAR'
          }
        });
      }
    }

    // 4. Quitar permisos en Rol_Permiso
    if (permisosQuitar.length > 0) {
      await this.prisma.rol_Permiso.deleteMany({
        where: {
          id_rol: idRol,
          id_permiso: { in: permisosQuitar }
        }
      });

      // Auditoría → registro también en AsignacionRolPermiso
      for (const idPermiso of permisosQuitar) {
        await this.prisma.asignacionRolPermiso.create({
          data: {
            id_rol: idRol,
            id_permiso: idPermiso,
            asignado_por: actorId,
            fecha_asignacion: fecha,
            accion: 'QUITAR'
          }
        });
      }
    }

    // 5. Registrar en log global
    await this.auditoria.registrarAccion({
      id_usuario: actorId,
      id_tipo_accion: 15, // ACTUALIZAR_ROL
      entidad_afectada: 'Rol',
      id_entidad: idRol,
    });

    return { message: 'Permisos del rol actualizados correctamente' };
  }




  async findAllPermisos() {
    return this.prisma.permiso.findMany({
      orderBy: { nombre_permiso: 'asc' },
    })
  }

  async findPermisosByRol(id_rol: number) {
    const rol = await this.prisma.rol.findUnique({
      where: { id_rol },
      include: {
        rolPermisos: {
          include: {
            permiso: true,
          },
        },
      },
    });

    if (!rol) return [];
    return rol.rolPermisos.map((rp) => rp.permiso);
  }

}
