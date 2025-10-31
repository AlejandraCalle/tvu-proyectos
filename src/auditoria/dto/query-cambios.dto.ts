import { IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

export class QueryCambiosDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  @Type(() => Number)
  @IsInt()
  id_video?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  @Type(() => Number)
  @IsInt()
  id_usuario?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  @Type(() => Number)
  @IsInt()
  id_tipo_cambio?: number;

  @IsOptional()
  @IsString()
  buscar?: string; // busca en detalle_cambio (ilike)

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}