import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, Put } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AssignEtiquetasDto } from './dto/assign-etiquetas.dto';
import { UnassignEtiquetasDto } from './dto/unassign-etiquetas.dto';
import { PermisosGuard } from 'src/auth/permisos.guard';
import { Permisos } from 'src/auth/permisos.decorator';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) { }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('CREAR_VIDEO')
  @Post()
  create(@Body() createVideoDto: CreateVideoDto, @Req() req: any) {
    return this.videosService.create(createVideoDto, req.user.id_usuario);
  }

  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('ACTUALIZAR_VIDEO')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVideoDto: UpdateVideoDto,
    @Req() req: any
  ) {
    return this.videosService.update(id, updateVideoDto, req.user.id_usuario);
  }


  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('ELIMINAR_VIDEO')
  @Patch(':id/soft-delete')
  sofDelete(@Param ('id') id:number, @Req() req){
    return this.videosService.softDelete(Number(id),req.user.id_usuario)
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('ELIMINAR_VIDEO')
  @Delete(':id/hard-delete')
  hardDelete(@Param ('id') id:number, @Req() req){
    return this.videosService.hardDelete(Number(id),req.user.id_usuario)
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('LISTAR_ROLES')
  @Get('/permisos/all')
  getAllPermisos() {
    return this.videosService.findAllEtiquetas();
  }

  //Controlar el asignar y desasignar etiquetas a videos
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('CONTROLAR_ETIQUETAS')
  @Put(':id/etiquetas')
  async updateEtiquetas(
    @Param('id', ParseIntPipe) id: number,
    @Body() etiquetasDto: { etiquetas: number[] },
    @Req() req: any
  ) {
    return this.videosService.updateEtiquetas(id, etiquetasDto.etiquetas, req.user.id_usuario);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('CONTROLAR_ETIQUETAS')
  @Get(':id/etiquetas')
  getEtiquetasByVideo(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.finEtiquetasByVideo(id);
  }

}
