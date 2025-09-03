import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISOS_KEY } from './permisos.decorator';

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener permisos requeridos del endpoint
    const permisosRequeridos = this.reflector.getAllAndOverride<string[]>(PERMISOS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!permisosRequeridos || permisosRequeridos.length === 0) return true;

    // Obtener el usuario del request (ya autenticado por JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    if (!usuario) throw new ForbiddenException('Usuario no autenticado');

    // Buscar los permisos de su rol
    const rolPermisos = await this.prisma.rol_Permiso.findMany({
      where: { id_rol: usuario.id_rol },
      include: { permiso: true },
    });

    const permisosUsuario = rolPermisos.map(rp => rp.permiso.nombre_permiso);

    // Verificar si al menos un permiso requerido está en los permisos del usuario
    const tienePermiso = permisosRequeridos.every(p => permisosUsuario.includes(p));

    if (!tienePermiso) throw new ForbiddenException('No tienes permisos para realizar esta acción');

    return true;
  }
}
