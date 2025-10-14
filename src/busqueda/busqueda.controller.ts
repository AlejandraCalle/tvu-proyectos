import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { BusquedaService } from './busqueda.service';
import { SearchVideoDto } from './dto/search-video.dto';

@Controller('busqueda')
export class BusquedaController {
  constructor(private readonly busquedaService: BusquedaService) { }

  @Post()
  async buscar(@Body() filtros: SearchVideoDto) {
    return this.busquedaService.buscarVideos(filtros);
  }

  @Get('profunda')
  async busquedaProfunda(@Query('q') termino: string) {
    return this.busquedaService.busquedaProfunda(termino);
  }

}
