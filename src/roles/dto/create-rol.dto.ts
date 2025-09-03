import { IsString, IsOptional } from 'class-validator';

export class CreateRolDto {
  @IsString()
  nombre_rol: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
