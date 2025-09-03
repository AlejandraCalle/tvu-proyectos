import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class QueryAccionesDto extends PaginationDto {
  @IsOptional() @IsInt()
  id_usuario?: number;

  @IsOptional() @IsInt()
  id_tipo_accion?: number;

  @IsOptional() @IsString()
  entidad_afectada?: string; // admite parcial

  @IsOptional() @IsInt()
  id_entidad?: number;

  @IsOptional() @IsDateString()
  fechaInicio?: string; // YYYY-MM-DD

  @IsOptional() @IsDateString()
  fechaFin?: string;    // YYYY-MM-DD
}
