import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateVideoDto {
  

  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNotEmpty()
  @IsInt()
  id_productor: number;

  @IsNotEmpty()
  @IsInt()
  id_categoria: number;
}
