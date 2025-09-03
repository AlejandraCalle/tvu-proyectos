import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { RegistrarAccionDto } from './dto/registrar-accion.dto';
import { RegistrarCambioVideoDto } from './dto/registrar-cambio-video.dto';
import { QueryAccionesDto } from './dto/query-acciones.dto';
import { QueryCambiosDto } from './dto/query-cambios.dto';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoria: AuditoriaService) {}

  // ---- Registro manual (normalmente se usa desde otros servicios)
  @Post('acciones')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  registrarAccion(@Body() dto: RegistrarAccionDto) {
    return this.auditoria.registrarAccion(dto);
  }

  @Post('cambios-video')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  registrarCambioVideo(@Body() dto: RegistrarCambioVideoDto) {
    return this.auditoria.registrarCambioVideo(dto);
  }

  // ---- Consultas
  @Get('acciones')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  listarAcciones(@Query() q: QueryAccionesDto) {
    return this.auditoria.listarAcciones(q);
  }

  @Get('cambios-video')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  listarCambios(@Query() q: QueryCambiosDto) {
    return this.auditoria.listarCambios(q);
  }

  // ---- Catálogos
  @Get('tipos/acciones')
  tiposAccion() {
    return this.auditoria.listarTiposAccion();
  }

  @Get('tipos/cambios')
  tiposCambio() {
    return this.auditoria.listarTiposCambio();
  }
}
