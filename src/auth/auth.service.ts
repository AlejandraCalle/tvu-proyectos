import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

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
}
