import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegistrarAccionDto {
  @IsInt()
  id_usuario!: number; // quién hizo la acción

  @IsInt()
  id_tipo_accion!: number; // catálogo TipoAccion

  @IsString()
  @IsNotEmpty()
  entidad_afectada!: string; // 'Usuario' | 'Categoria' | 'Etiqueta' | 'Rol' | 'Permiso' | 'AsignacionRolPermiso' | 'AsignacionVideoEtiqueta' | ...

  @IsInt()
  id_entidad!: number; // ID numérico de la entidad afectada*

  /**
   * *Nota sobre relaciones con clave compuesta (p.ej. AsignacionRolPermiso y AsignacionVideoEtiqueta):
   *  - Usaremos `id_entidad` con el ID "principal" (p. ej. id_rol o id_video),
   *  - y codificaremos la referencia completa en `entidad_afectada`:
   *      'AsignacionRolPermiso[id_rol=1,id_permiso=2,asignado_por=99]'
   *  Esto evita migraciones. En la sección 7 te dejo una mejora opcional con JSONB.
   */
}
