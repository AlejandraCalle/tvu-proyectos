import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Req, } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermisosGuard } from 'src/auth/permisos.guard';
import { Permisos } from 'src/auth/permisos.decorator';

@Controller('categorias')
export class CategoriasController {
    constructor(private readonly categoriasService: CategoriasService) { }

    @UseGuards(AuthGuard('jwt'), PermisosGuard)
    @Permisos('CREAR_CATEGORIA')
    @Post()
    create(@Body() dto: CreateCategoriaDto, @Req() req: any) {
        return this.categoriasService.create(dto, req.user.id_usuario);
    }

    @Get()
    findAll() {
        return this.categoriasService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriasService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'), PermisosGuard)
    @Permisos('ACTUALIZAR_CATEGORIA')
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCategoriaDto,
        @Req() req: any
    ) {
        return this.categoriasService.update(id, dto, req.user.id_usuario);
    }

    @UseGuards(AuthGuard('jwt'), PermisosGuard)
    @Permisos('ELIMINAR_CATEGORIA')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.categoriasService.remove(id, req.user.id_usuario);
    }
}
