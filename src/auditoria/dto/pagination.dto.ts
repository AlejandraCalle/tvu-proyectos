import { IsInt, IsOptional, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : 1)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : 100)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 100; // Cambiado de 10 a 100
}