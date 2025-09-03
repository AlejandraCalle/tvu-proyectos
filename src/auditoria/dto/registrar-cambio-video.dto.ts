import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class RegistrarCambioVideoDto {
  @IsInt()
  id_video!: number;

  @IsInt()
  id_usuario!: number;

  @IsInt()
  id_tipo_cambio!: number; // catálogo TipoCambio (p.ej. "ACTUALIZAR_METADATOS", "ASIGNAR_ETIQUETA", etc.)

  @IsString()
  @IsNotEmpty()
  detalle_cambio!: string; // describe qué cambió (antes -> después, o etiqueta X asignada, etc.)
}
