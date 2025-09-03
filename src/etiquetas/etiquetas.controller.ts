import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Req, } from '@nestjs/common';
import { EtiquetasService } from './etiquetas.service';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { UpdateEtiquetaDto } from './dto/update-etiqueta.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermisosGuard } from 'src/auth/permisos.guard';
import { Permisos } from 'src/auth/permisos.decorator';

@Controller('etiquetas')
export class EtiquetasController {
    constructor(private readonly etiquetasService: EtiquetasService) { }

    @UseGuards(AuthGuard('jwt'), PermisosGuard)
    @Permisos('CREAR_ETIQUETA')
    @Post()
    create(@Body() dto: CreateEtiquetaDto, @Req() req: any) {
        return this.etiquetasService.create(dto, req.user.id_usuario);
    }

    @Get()
    findAll() {
        return this.etiquetasService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.etiquetasService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'),  PermisosGuard)
    @Permisos('ACTUALIZAR_ETIQUETA')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEtiquetaDto, @Req() req: any) {
        return this.etiquetasService.update(id, dto, req.user.id_usuario);
    }

    @UseGuards(AuthGuard('jwt'),  PermisosGuard)
    @Permisos('ELIMINAR_ETIQUETA')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.etiquetasService.remove(id, req.user.id_usuario);
    }
}
