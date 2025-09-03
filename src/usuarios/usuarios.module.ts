import { forwardRef, Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; // asegúrate de que esta ruta sea correcta
import { AuditoriaModule } from 'src/auditoria/auditoria.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), AuditoriaModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
