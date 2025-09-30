import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRolDto {
  @IsString()
  nombre_rol: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean = true;
}
