import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
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
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.videosService.remove(id, req.user.id_usuario);
  }

  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('CONTROLAR_ETIQUETAS')
  @Post('assign-tags')
  assignTags(@Body() assignTagsDto: AssignEtiquetasDto, @Req() req: any) {
    return this.videosService.assignTags(assignTagsDto, req.user.id_usuario);
  }

  @UseGuards(JwtAuthGuard,PermisosGuard)
  @Permisos('CONTROLAR_ETIQUETAS')
  @Post('unassign-tags')
  unassignTags(@Body() unassignTagsDto: UnassignEtiquetasDto, @Req() req: any) {
    return this.videosService.unassignTags(unassignTagsDto, req.user.id_usuario);
  }

}
