import { IsOptional, IsString, IsInt } from 'class-validator';

export class QueryVideoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsInt()
  id_categoria?: number;

  @IsOptional()
  @IsInt()
  id_productor?: number;
}
