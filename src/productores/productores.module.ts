import { Module } from '@nestjs/common';
import { ProductoresService } from './productores.service';
import { ProductoresController } from './productores.controller';
import { AuditoriaModule } from 'src/auditoria/auditoria.module';

@Module({
  imports: [AuditoriaModule],
  providers: [ProductoresService],
  controllers: [ProductoresController]
})
export class ProductoresModule {}
