import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermisosGuard } from 'src/auth/permisos.guard';
import { Permisos } from 'src/auth/permisos.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

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
  @Permisos('ELMINAR_ROL')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.rolesService.remove(+id, req.user.id_usuario);
  }
}
