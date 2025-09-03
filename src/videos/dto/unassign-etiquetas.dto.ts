import { IsInt, IsArray } from 'class-validator';

export class UnassignEtiquetasDto {
  @IsInt()
  id_video: number;

  @IsArray()
  @IsInt({ each: true })
  ids_etiquetas: number[];

}
