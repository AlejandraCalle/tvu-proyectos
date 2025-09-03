import { IsOptional, IsString, IsInt, IsArray, IsDateString } from 'class-validator';

export class SearchVideoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsInt()
  id_categoria?: number;

  @IsOptional()
  @IsInt()
  id_productor?: number;

  @IsOptional()
  @IsArray()
  etiquetas?: number[];  // array de IDs de etiquetas
}
