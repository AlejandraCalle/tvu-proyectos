import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoriaDto {
  @IsNotEmpty()
  @IsString()
  nombre_categoria: string;

  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean = true;
}
