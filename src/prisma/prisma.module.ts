import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // esto permite usar PrismaService en cualquier módulo sin importarlo de nuevo
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
