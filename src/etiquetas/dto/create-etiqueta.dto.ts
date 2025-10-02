import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEtiquetaDto {
  @IsNotEmpty()
  @IsString()
  nombre_etiqueta: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean = true;
}
