import { PartialType } from '@nestjs/mapped-types';
import { CreateProductorDto } from './create-productor.dto';


export class UpdateProductorDto extends PartialType(CreateProductorDto) { }