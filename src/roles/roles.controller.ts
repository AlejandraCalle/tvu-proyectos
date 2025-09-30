import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermisosGuard } from 'src/auth/permisos.guard';
import { Permisos } from 'src/auth/permisos.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('CREAR_ROL')
  @Post()
  create(@Body() createRolDto: CreateRolDto, @Req() req: any) {
    return this.rolesService.create(createRolDto, req.user.id_usuario);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('LISTAR_ROLES')
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('LISTAR_ROLES')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('ACTUALIZAR_ROL')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRolDto: UpdateRolDto, @Req() req: any) {
    return this.rolesService.update(+id, updateRolDto, req.user.id_usuario);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('ELIMINAR_ROL')
  @Patch(':id/soft-delete')
  softDelete(@Param('id') id: number, @Req() req) {
    return this.rolesService.softDelete(Number(id), req.user.id_usuario)
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('ELIMINAR_ROL')
  @Delete(':id/hard-delete')
  hardDelete(@Param('id') id: number, @Req() req) {
    return this.rolesService.hardDelete(Number(id), req.user.id_usuario)
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('LISTAR_ROLES')
  @Get('/permisos/all')
  getAllPermisos() {
    return this.rolesService.findAllPermisos();
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('LISTAR_ROLES')
  @Get(':id/permisos')
  getPermisosByRol(@Param('id') id: string) {
    return this.rolesService.findPermisosByRol(+id);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('CONTROLAR_PERMISO_A_ROL')
  @Put(':idRol/permisos')
  async actualizarPermisos(
    @Param('idRol') idRol: number,
    @Body() body: { permisos: number[] },
    @Req() req: any
  ) {
    const actorId = req.user.id_usuario;
    return this.rolesService.actualizarPermisosRol(idRol, body.permisos, actorId);
  }


}
