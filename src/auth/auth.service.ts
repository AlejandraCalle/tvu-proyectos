import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) { }

  // Validar usuario para login
  async validateUser(correo: string, contraseña: string) {
    const user = await this.usuariosService.findByCorreo(correo);
    if (!user) throw new UnauthorizedException('Correo o contraseña incorrectos');

    const passwordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!passwordValid) throw new UnauthorizedException('Correo o contraseña incorrectos');

    // Retornar usuario sin contraseña
    const { contraseña: _, ...result } = user;
    return result;
  }

  // Generar JWT
  async login(user: any) {
    const payload = {
      id_usuario: user.id_usuario,
      correo: user.correo,
      rol: user.rol.nombre_rol,
      id_rol: user.rol.id_rol,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Cambiar contraseña
  async changePassword(userId: number, actual: string, nueva: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: userId },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Verificar contraseña actual
    const match = await bcrypt.compare(actual, usuario.contraseña);
    if (!match) throw new UnauthorizedException('Contraseña actual incorrecta');

    // Guardar nueva
    const hashed = await bcrypt.hash(nueva, 10);

    await this.prisma.usuario.update({
      where: { id_usuario: userId },
      data: { contraseña: hashed },
    });

    // Aquí puedes opcionalmente registrar auditoría también
    await this.auditoria.registrarAccion({
      id_usuario: userId,
      id_tipo_accion: 2, // ACTUALIZAR_USUARIO
      entidad_afectada: 'Usuario',
      id_entidad: userId,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }


}