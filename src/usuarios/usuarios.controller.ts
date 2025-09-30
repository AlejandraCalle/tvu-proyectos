import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermisosGuard } from 'src/auth/permisos.guard';
import { Permisos } from 'src/auth/permisos.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  // Endpoint para obtener info del usuario logueado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    return this.usuariosService.getProfile(req.user.id_usuario);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('CREAR_USUARIO')
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Req() req: any) {
    return this.usuariosService.create(createUsuarioDto, req.user.id_usuario);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('LISTAR_USUARIOS')
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('LISTAR_USUARIOS')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('ACTUALIZAR_USUARIO')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto, @Req() req: any) {
    return this.usuariosService.update(+id, updateUsuarioDto, req.user.id_usuario);
  }

  @Put(':id/reset-password')
  @UseGuards(JwtAuthGuard, PermisosGuard, RolesGuard)
  @Permisos('ACTUALIZAR_USUARIO')
  @Roles('Administrador')
  async resetPassword(@Param('id') id: string) {
    const newPass = await this.usuariosService.resetPassword(Number(id));
    return { nueva_contraseña: newPass };
  }
  
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('ELIMINAR_USUARIO')
  @Patch(':id/soft-delete')
  softDelete(@Param('id') id: number, @Req() req) {
    return this.usuariosService.softDelete(Number(id), req.user.id_usuario);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('ELIMINAR_USUARIO')
  @Delete(':id/hard-delete')
  hardDelete(@Param('id') id: number, @Req() req) {
    return this.usuariosService.hardDelete(Number(id), req.user.id_usuario);
  }
}
