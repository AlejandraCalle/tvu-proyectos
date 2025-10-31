import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class QueryAccionesDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_usuario?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_tipo_accion?: number;

  @IsOptional()
  @IsString()
  entidad_afectada?: string; // admite parcial

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_entidad?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string; // YYYY-MM-DD

  @IsOptional()
  @IsDateString()
  fechaFin?: string;    // YYYY-MM-DD
}