import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { PrismaModule } from './prisma/prisma.module';
import { VideosModule } from './videos/videos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { EtiquetasModule } from './etiquetas/etiquetas.module';
import { BusquedaModule } from './busqueda/busqueda.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { ProductoresModule } from './productores/productores.module';

@Module({
  imports: [AuthModule, UsuariosModule, RolesModule, PrismaModule, VideosModule, CategoriasModule, EtiquetasModule, BusquedaModule, AuditoriaModule, ProductoresModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
