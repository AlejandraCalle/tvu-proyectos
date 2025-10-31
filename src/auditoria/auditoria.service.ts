import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarAccionDto } from './dto/registrar-accion.dto';
import { RegistrarCambioVideoDto } from './dto/registrar-cambio-video.dto';
import { QueryAccionesDto } from './dto/query-acciones.dto';
import { QueryCambiosDto } from './dto/query-cambios.dto';
import { endOfDayInclusive, startOfDay } from './utils/date.util';

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Registro ----------
  async registrarAccion(dto: RegistrarAccionDto) {
    // Valida existencia de catálogos / usuario (opcional)
    const [usuario, tipo] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { id_usuario: dto.id_usuario } }),
      this.prisma.tipoAccion.findUnique({ where: { id_tipo_accion: dto.id_tipo_accion } }),
    ]);
    if (!usuario) throw new BadRequestException('Usuario no existe');
    if (!tipo) throw new BadRequestException('TipoAccion no existe');

    return this.prisma.registroAcciones.create({
      data: {
        id_usuario: dto.id_usuario,
        id_tipo_accion: dto.id_tipo_accion,
        entidad_afectada: dto.entidad_afectada,
        id_entidad: dto.id_entidad,
        fecha_accion: new Date(),
      },
    });
  }

  async registrarCambioVideo(dto: RegistrarCambioVideoDto) {
    const [usuario, tipo, video] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { id_usuario: dto.id_usuario } }),
      this.prisma.tipoCambio.findUnique({ where: { id_tipo_cambio: dto.id_tipo_cambio } }),
      this.prisma.video.findUnique({ where: { id_video: dto.id_video } }),
    ]);
    if (!usuario) throw new BadRequestException('Usuario no existe');
    if (!tipo) throw new BadRequestException('TipoCambio no existe');
    if (!video) throw new BadRequestException('Video no existe');

    return this.prisma.historialCambios.create({
      data: {
        id_video: dto.id_video,
        id_usuario: dto.id_usuario,
        id_tipo_cambio: dto.id_tipo_cambio,
        fecha_cambio: new Date(),
        detalle_cambio: dto.detalle_cambio,
      },
    });
  }

  // ---------- Consultas ----------
  async listarAcciones(q: QueryAccionesDto) {
    console.log('🔍 Service - Query recibida:', q);
    
    const where: any = { AND: [] as any[] };

    if (q.id_usuario) {
      where.AND.push({ id_usuario: q.id_usuario });
      console.log('  ✓ Filtro id_usuario:', q.id_usuario);
    }
    if (q.id_tipo_accion) {
      where.AND.push({ id_tipo_accion: q.id_tipo_accion });
      console.log('  ✓ Filtro id_tipo_accion:', q.id_tipo_accion);
    }
    if (q.id_entidad) {
      where.AND.push({ id_entidad: q.id_entidad });
      console.log('  ✓ Filtro id_entidad:', q.id_entidad);
    }
    if (q.entidad_afectada) {
      where.AND.push({
        entidad_afectada: { contains: q.entidad_afectada, mode: 'insensitive' },
      });
      console.log('  ✓ Filtro entidad_afectada:', q.entidad_afectada);
    }
    if (q.fechaInicio) {
      const fecha = startOfDay(q.fechaInicio);
      where.AND.push({ fecha_accion: { gte: fecha } });
      console.log('  ✓ Filtro fechaInicio:', fecha);
    }
    if (q.fechaFin) {
      const fecha = endOfDayInclusive(q.fechaFin);
      where.AND.push({ fecha_accion: { lte: fecha } });
      console.log('  ✓ Filtro fechaFin:', fecha);
    }
    
    if (!where.AND.length) {
      delete where.AND;
      console.log('  ℹ️ Sin filtros, buscando todo');
    }

    console.log('📊 Where final:', JSON.stringify(where, null, 2));

    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 10;
    
    const [items, total] = await Promise.all([
      this.prisma.registroAcciones.findMany({
        where,
        include: {
          usuario: true,
          tipoAccion: true,
        },
        orderBy: { fecha_accion: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.registroAcciones.count({ where }),
    ]);

    console.log('✅ Service - Resultados:', { total, items: items.length });

    return {
      page,
      pageSize,
      total,
      items,
    };
  }

  async listarCambios(q: QueryCambiosDto) {
    console.log('🔍 Service - Query cambios recibida:', q);
    
    const where: any = { AND: [] as any[] };

    if (q.id_video) {
      where.AND.push({ id_video: q.id_video });
      console.log('  ✓ Filtro id_video:', q.id_video);
    }
    if (q.id_usuario) {
      where.AND.push({ id_usuario: q.id_usuario });
      console.log('  ✓ Filtro id_usuario:', q.id_usuario);
    }
    if (q.id_tipo_cambio) {
      where.AND.push({ id_tipo_cambio: q.id_tipo_cambio });
      console.log('  ✓ Filtro id_tipo_cambio:', q.id_tipo_cambio);
    }
    if (q.buscar) {
      where.AND.push({
        detalle_cambio: { contains: q.buscar, mode: 'insensitive' },
      });
      console.log('  ✓ Filtro buscar:', q.buscar);
    }
    if (q.fechaInicio) {
      const fecha = startOfDay(q.fechaInicio);
      where.AND.push({ fecha_cambio: { gte: fecha } });
      console.log('  ✓ Filtro fechaInicio:', fecha);
    }
    if (q.fechaFin) {
      const fecha = endOfDayInclusive(q.fechaFin);
      where.AND.push({ fecha_cambio: { lte: fecha } });
      console.log('  ✓ Filtro fechaFin:', fecha);
    }
    
    if (!where.AND.length) {
      delete where.AND;
      console.log('  ℹ️ Sin filtros, buscando todo');
    }

    console.log('📊 Where final:', JSON.stringify(where, null, 2));

    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 10;
    
    const [items, total] = await Promise.all([
      this.prisma.historialCambios.findMany({
        where,
        include: {
          usuario: true,
          tipoCambio: true,
          video: true,
        },
        orderBy: { fecha_cambio: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.historialCambios.count({ where }),
    ]);

    console.log('✅ Service - Resultados cambios:', { total, items: items.length });

    return {
      page,
      pageSize,
      total,
      items,
    };
  }

  // ---------- Catálogos ----------
  listarTiposAccion() {
    return this.prisma.tipoAccion.findMany({ orderBy: { id_tipo_accion: 'asc' } });
  }

  listarTiposCambio() {
    return this.prisma.tipoCambio.findMany({ orderBy: { id_tipo_cambio: 'asc' } });
  }
}