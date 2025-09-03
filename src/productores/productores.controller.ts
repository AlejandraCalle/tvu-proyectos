import { Controller, Get, Post, Body, Param, Query, Put, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { ProductoresService } from './productores.service';
import { CreateProductorDto } from './dto/create-productor.dto';
import { UpdateProductorDto } from './dto/update-productor.dto';
import { PermisosGuard } from 'src/auth/permisos.guard';
import { Permisos } from 'src/auth/permisos.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';


@Controller('productores')
export class ProductoresController {
    constructor(private readonly service: ProductoresService) { }

    @UseGuards(JwtAuthGuard, PermisosGuard)
    @Permisos('CREAR_PRODUCTOR')
    @Post()
    create(@Body() dto: CreateProductorDto, @Req() req: any) {
        return this.service.create(dto, req.user.id_usuario);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }


    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    @UseGuards(JwtAuthGuard, PermisosGuard)
    @Permisos('ACTUALIZAR_PRODUCTOR')
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductorDto, @Req() req: any) {
        return this.service.update(id, dto, req.user.id_usuario);
    }

    @UseGuards(JwtAuthGuard, PermisosGuard)
    @Permisos('ELIMINAR_PRODUCTOR')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.service.remove(id, req.user.id_usuario);
    }
}