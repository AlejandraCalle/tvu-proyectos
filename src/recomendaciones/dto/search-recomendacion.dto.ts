import { IsOptional, IsString } from 'class-validator';

export class SearchRecomendacionDto {
  @IsString()
  query: string; // texto o frase para buscar similitudes

  @IsOptional()
  id_video?: number; // opcional, para buscar similares a un video específico
}
