import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RecomendacionesService } from './recomendaciones.service';
import { SearchRecomendacionDto } from './dto/search-recomendacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recomendaciones')
@UseGuards(JwtAuthGuard)
export class RecomendacionesController {
  constructor(private readonly recomendacionesService: RecomendacionesService) {}

  @Post('search')
  async search(@Body() dto: SearchRecomendacionDto) {
    return this.recomendacionesService.buscarSimilares(dto);
  }
}
