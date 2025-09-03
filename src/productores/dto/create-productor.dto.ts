import { IsString, IsOptional, MaxLength } from 'class-validator';


export class CreateProductorDto {
    @IsString()
    @MaxLength(150)
    nombre_productor: string;


    @IsOptional()
    @IsString()
    @MaxLength(150)
    contacto?: string;
}