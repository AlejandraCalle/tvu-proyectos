import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';


export class CreateProductorDto {
    @IsString()
    @MaxLength(150)
    nombre_productor: string;


    @IsOptional()
    @IsString()
    @MaxLength(150)
    contacto?: string;

    @IsOptional()
    @IsBoolean()
    estado?: boolean = true;
}