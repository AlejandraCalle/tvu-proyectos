import { Module, forwardRef } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; // ya lo tienes
import { AuditoriaModule } from 'src/auditoria/auditoria.module';
// Si usas RolesGuard via providers globales, no hace falta importarlo aquí.

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), AuditoriaModule],
  controllers: [VideosController],
  providers: [VideosService],
  exports: [VideosService],
})
export class VideosModule {}
