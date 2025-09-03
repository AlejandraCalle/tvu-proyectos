import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class QueryCambiosDto extends PaginationDto {
  @IsOptional() @IsInt()
  id_video?: number;

  @IsOptional() @IsInt()
  id_usuario?: number;

  @IsOptional() @IsInt()
  id_tipo_cambio?: number;

  @IsOptional() @IsString()
  buscar?: string; // busca en detalle_cambio (ilike)

  @IsOptional() @IsDateString()
  fechaInicio?: string;

  @IsOptional() @IsDateString()
  fechaFin?: string;
}
