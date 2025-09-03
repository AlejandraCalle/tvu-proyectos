import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoriaDto {
  @IsNotEmpty()
  @IsString()
  nombre_categoria: string;

  @IsString()
  descripcion?: string;
}
