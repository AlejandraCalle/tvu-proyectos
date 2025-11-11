import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateVideoDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @Transform(({ value }) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? value : parsed;
  })
  @IsNotEmpty()
  @IsInt()
  id_productor: number;

  @Transform(({ value }) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? value : parsed;
  })
  @IsNotEmpty()
  @IsInt()
  id_categoria: number;

  // 🆕 Campos opcionales para info del archivo
  @IsOptional()
  @IsString()
  nombre_archivo?: string;

  @IsOptional()
  @IsString()
  ruta_archivo?: string;

  @IsOptional()
  tamaño_bytes?: bigint;

  @IsOptional()
  @IsString()
  formato?: string;

  @IsOptional()
  @IsInt()
  duracion_segundos?: number;
}
