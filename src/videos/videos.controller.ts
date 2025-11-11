import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, Put, UseInterceptors, UploadedFile, HttpStatus, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermisosGuard } from 'src/auth/permisos.guard';
import { Permisos } from 'src/auth/permisos.decorator';
import { multerConfig } from 'src/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) { }

  // 🆕 Endpoint para crear video CON archivo
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('CREAR_VIDEO')
  @Post('upload')
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() createVideoDto: CreateVideoDto,
    @Req() req: any,
  ) {
    // Validar que se haya subido un archivo
    if (!file) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No se proporcionó ningún archivo de video',
      };
    }

    // ✅ Ya no es necesario parsear manualmente - el @Transform del DTO lo hace
    const video = await this.videosService.createWithFile(
      createVideoDto,
      file,
      req.user.id_usuario,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Video subido exitosamente',
      data: {
        id_video: video.id_video,
        titulo: video.titulo,
        código_único: video.código_único,
        nombre_archivo: video.nombre_archivo,
        tamaño_mb: Number(video.tamaño_bytes) / (1024 * 1024),
        formato: video.formato,
      },
    };
  }

  // Endpoint original (crear video SIN archivo)
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @Permisos('CREAR_VIDEO')
  @Post()
  create(@Body() createVideoDto: CreateVideoDto, @Req() req: any) {
    return this.videosService.create(createVideoDto, req.user.id_usuario);
  }

  // 🆕 Endpoint para descargar el archivo de video
  @Get(':id/download')
  async downloadVideo(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { file, filename, mimetype } = await this.videosService.downloadVideo(id);

    // Configurar headers para la descarga
    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    });

    return file;
  }

  // 🆕 Endpoint para obtener información del archivo
  @Get(':id/file-info')
  getFileInfo(@Param('id', ParseIntPipe) id: number) {
    return this.videosService.getFileInfo(id);
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
