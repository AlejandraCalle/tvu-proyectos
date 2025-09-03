import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEtiquetaDto {
  @IsNotEmpty()
  @IsString()
  nombre_etiqueta: string;
}
