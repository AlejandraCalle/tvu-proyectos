import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    private prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) { }

  // Crear usuario con registro de acción
  async create(createUsuarioDto: CreateUsuarioDto, id_actor: number) {
    const hashedPassword = await bcrypt.hash(createUsuarioDto.contraseña, 10);

    // 1. Verificar rol del usuario
    const rol = await this.prisma.rol.findUnique({
      where: { id_rol: createUsuarioDto.id_rol },
    });

    if (!rol) {
      throw new Error("El rol especificado no existe");
    }

    let id_productor: number | null = null;

    // 2. Si el rol es "Productor", crear también en tabla Productor
    if (rol.nombre_rol === "Productor") {
      const productor = await this.prisma.productor.create({
        data: {
          nombre_productor: `${createUsuarioDto.nombre} ${createUsuarioDto.apellido}`,
          contacto: createUsuarioDto.correo, // opcional
        },
      });
      id_productor = productor.id_productor;
    }

    // 3. Crear el usuario (y vincularlo al productor si aplica)
    const usuario = await this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        contraseña: hashedPassword,
        estado: createUsuarioDto.estado ?? true,
        id_productor: id_productor, // null si no es Productor
      },
      include: { rol: true, productor: true },
    });

    // 4. Registrar acción en auditoría
    await this.auditoria.registrarAccion({
      id_usuario: id_actor,
      id_tipo_accion: 1, // CREAR_USUARIO (seed)
      entidad_afectada: 'Usuario',
      id_entidad: usuario.id_usuario,
    });

    return usuario;
  }


  // Listar todos los usuarios
  findAll() {
    return this.prisma.usuario.findMany({ include: { rol: true } });
  }

  // Obtener usuario por ID
  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { rol: true },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  // Actualizar usuario con registro de acción
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto, id_actor: number) {
    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { rol: true, productor: true },
    });

    if (!usuarioExistente) throw new NotFoundException('Usuario no encontrado');

    // Encriptar contraseña si se manda
    if (updateUsuarioDto.contraseña) {
      updateUsuarioDto.contraseña = await bcrypt.hash(updateUsuarioDto.contraseña, 10);
    }

    // Si hay cambio de rol
    let id_productor: number | null = usuarioExistente.id_productor;

    if (updateUsuarioDto.id_rol) {
      const nuevoRol = await this.prisma.rol.findUnique({
        where: { id_rol: updateUsuarioDto.id_rol },
      });

      if (!nuevoRol) throw new NotFoundException('Rol no encontrado');

      if (nuevoRol.nombre_rol === 'Productor' && !usuarioExistente.id_productor) {
        // 🔹 Caso 1: El usuario NO era productor y ahora será productor
        const productor = await this.prisma.productor.create({
          data: {
            nombre_productor: `${usuarioExistente.nombre} ${usuarioExistente.apellido}`,
            contacto: usuarioExistente.correo,
          },
        });
        id_productor = productor.id_productor;
      } else if (nuevoRol.nombre_rol !== 'Productor' && usuarioExistente.id_productor) {
        // 🔹 Caso 2: El usuario era productor y ahora ya no
        await this.prisma.productor.delete({
          where: { id_productor: usuarioExistente.id_productor },
        });
        id_productor = null;
      }
    }

    // Actualizar usuario
    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: {
        ...updateUsuarioDto,
        id_productor: id_productor,
      },
      include: { rol: true, productor: true },
    });

    // Auditoría
    await this.auditoria.registrarAccion({
      id_usuario: id_actor,
      id_tipo_accion: 2, // ACTUALIZAR_USUARIO
      entidad_afectada: 'Usuario',
      id_entidad: id,
    });

    return usuarioActualizado;
  }


  // Eliminar usuario con registro de acción
  async remove(id: number, id_actor: number) {
    const usuarioExistente = await this.prisma.usuario.findUnique({ where: { id_usuario: id } });
    if (!usuarioExistente) throw new NotFoundException('Usuario no encontrado');

    const eliminado = await this.prisma.usuario.delete({ where: { id_usuario: id } });

    await this.auditoria.registrarAccion({
      id_usuario: id_actor,
      id_tipo_accion: 3, // ELIMINAR_USUARIO (agregar al seed)
      entidad_afectada: 'Usuario',
      id_entidad: id,
    });

    return eliminado;
  }

  // Buscar usuario por correo (login)
  async findByCorreo(correo: string) {
    return this.prisma.usuario.findUnique({ where: { correo }, include: { rol: true } });
  }
}
