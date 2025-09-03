import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AuditoriaController],
  providers: [AuditoriaService, PrismaService],
  exports: [AuditoriaService], // importante para usarlo en otros módulos
})
export class AuditoriaModule {}
