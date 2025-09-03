import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // ------------------------------
  // TIPOS DE ACCIONES (auditoría global)
  // ------------------------------

  const acciones = [
    { id_tipo_accion: 1, nombre_accion: 'CREAR_USUARIO' },
    { id_tipo_accion: 2, nombre_accion: 'ACTUALIZAR_USUARIO' },
    { id_tipo_accion: 3, nombre_accion: 'ELIMINAR_USUARIO' },

    { id_tipo_accion: 4, nombre_accion: 'ASIGNAR_PERMISO_A_ROL' },
    { id_tipo_accion: 5, nombre_accion: 'CREAR_ETIQUETA' },
    { id_tipo_accion: 6, nombre_accion: 'ACTUALIZAR_ETIQUETA' },
    { id_tipo_accion: 7, nombre_accion: 'ELIMINAR_ETIQUETA' },

    { id_tipo_accion: 8, nombre_accion: 'CREAR_CATEGORIA' },
    { id_tipo_accion: 9, nombre_accion: 'ACTUALIZAR_CATEGORIA' },
    { id_tipo_accion: 10, nombre_accion: 'ELIMINAR_CATEGORIA' },

    { id_tipo_accion: 11, nombre_accion: 'CREAR_VIDEO' },
    { id_tipo_accion: 12, nombre_accion: 'ACTUALIZAR_VIDEO' },
    { id_tipo_accion: 13, nombre_accion: 'ELIMINAR_VIDEO' },

    { id_tipo_accion: 14, nombre_accion: 'CREAR_ROL' },
    { id_tipo_accion: 15, nombre_accion: 'ACTUALIZAR_ROL' },
    { id_tipo_accion: 16, nombre_accion: 'ELIMINAR_ROL' },

    { id_tipo_accion: 17, nombre_accion: 'CREAR_PRODUCTOR' },
    { id_tipo_accion: 18, nombre_accion: 'ACTUALIZAR_PRODUCTOR' },
    { id_tipo_accion: 19, nombre_accion: 'ELIMINAR_PRODUCTOR' },
  ];

  for (const a of acciones) {
    await prisma.tipoAccion.upsert({
      where: { id_tipo_accion: a.id_tipo_accion },
      update: {},
      create: a,
    });
  }

  // ------------------------------
  // TIPOS DE CAMBIOS (historial de cambios en videos)
  // ------------------------------
  const cambios = [
    { id_tipo_cambio: 100, nombre_cambio: 'ACTUALIZAR_TITULO' },
    { id_tipo_cambio: 101, nombre_cambio: 'ACTUALIZAR_DESCRIPCION' },
    { id_tipo_cambio: 102, nombre_cambio: 'ACTUALIZAR_PRODUCTOR' },
    { id_tipo_cambio: 103, nombre_cambio: 'ACTUALIZAR_CATEGORIA' },
    { id_tipo_cambio: 104, nombre_cambio: 'ASIGNAR_ETIQUETA' },
    { id_tipo_cambio: 105, nombre_cambio: 'REMOVER_ETIQUETA' },
  ];

  for (const c of cambios) {
    await prisma.tipoCambio.upsert({
      where: { id_tipo_cambio: c.id_tipo_cambio },
      update: {},
      create: c,
    });
  }
}

main().finally(() => prisma.$disconnect());
