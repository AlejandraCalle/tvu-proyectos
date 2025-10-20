import { Module } from '@nestjs/common';
import {  } from './recomendaciones.controller';
import { RecomendacionesController } from './recomendaciones.controller';
import { RecomendacionesService } from './recomendaciones.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RecomendacionesController],
  providers: [RecomendacionesService, PrismaService],
})
export class RecomendacionesModule {}
