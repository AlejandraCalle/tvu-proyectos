import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsEmail()
  correo: string;

  @IsNotEmpty()
  @MinLength(6)
  contraseña: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean = true; // por defecto activo


  @IsInt()
  id_rol: number;
}
