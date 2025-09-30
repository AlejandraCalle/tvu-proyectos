import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    // 🔹 Crear roles con estado activo
    const rolesData = [
        { id_rol: 1, nombre_rol: 'Administrador', descripcion: 'Control total del sistema', estado: true },
        { id_rol: 2, nombre_rol: 'Productor', descripcion: 'Puede subir y etiquetar videos', estado: true },
        { id_rol: 3, nombre_rol: 'Pasante', descripcion: 'Rol para editar contenidos', estado: true },
        { id_rol: 4, nombre_rol: 'Invitado', descripcion: 'Solo puede ver', estado: true },
    ]
    for (const rol of rolesData) {
        await prisma.rol.upsert({
            where: { id_rol: rol.id_rol },
            update: rol,
            create: rol,
        })
    }

    // 🔹 Crear permisos
    const permisosData = [
        { id_permiso: 1, nombre_permiso: 'CREAR_USUARIO' },
        { id_permiso: 2, nombre_permiso: 'ACTUALIZAR_USUARIO' },
        { id_permiso: 3, nombre_permiso: 'ELIMINAR_USUARIO' },
        { id_permiso: 4, nombre_permiso: 'CONTROLAR_PERMISO_A_ROL' },
        { id_permiso: 5, nombre_permiso: 'CREAR_ETIQUETA' },
        { id_permiso: 6, nombre_permiso: 'ACTUALIZAR_ETIQUETA' },
        { id_permiso: 7, nombre_permiso: 'ELIMINAR_ETIQUETA' },
        { id_permiso: 8, nombre_permiso: 'CREAR_CATEGORIA' },
        { id_permiso: 9, nombre_permiso: 'ACTUALIZAR_CATEGORIA' },
        { id_permiso: 10, nombre_permiso: 'ELIMINAR_CATEGORIA' },
        { id_permiso: 11, nombre_permiso: 'CREAR_VIDEO' },
        { id_permiso: 12, nombre_permiso: 'ACTUALIZAR_VIDEO' },
        { id_permiso: 13, nombre_permiso: 'ELIMINAR_VIDEO' },
        { id_permiso: 14, nombre_permiso: 'CREAR_ROL' },
        { id_permiso: 15, nombre_permiso: 'ACTUALIZAR_ROL' },
        { id_permiso: 16, nombre_permiso: 'ELIMINAR_ROL' },
        { id_permiso: 17, nombre_permiso: 'CREAR_PRODUCTOR' },
        { id_permiso: 18, nombre_permiso: 'ACTUALIZAR_PRODUCTOR' },
        { id_permiso: 19, nombre_permiso: 'ELIMINAR_PRODUCTOR' },
        { id_permiso: 20, nombre_permiso: 'LISTAR_USUARIOS' },
        { id_permiso: 21, nombre_permiso: 'LISTAR_ROLES' },
        { id_permiso: 22, nombre_permiso: 'CONTROLAR_ETIQUETAS' },
    ]
    for (const permiso of permisosData) {
        await prisma.permiso.upsert({
            where: { id_permiso: permiso.id_permiso },
            update: permiso,
            create: permiso,
        })
    }

    // 🔹 Crear usuario administrador
    const passwordHash = await bcrypt.hash('8326547', 10) // Genera el hash del password
    await prisma.usuario.upsert({
        where: { id_usuario: 1 },
        update: {
            nombre: 'Admin',
            apellido: 'TVU',
            correo: 'admin@tvu.com',
            contraseña: passwordHash,
            estado: true,
            id_rol: 1,
        },
        create: {
            id_usuario: 1,
            nombre: 'Admin',
            apellido: 'TVU',
            correo: 'admin@tvu.com',
            contraseña: passwordHash,
            estado: true,
            id_rol: 1,
        },
    })


    // 🔹 Crear Rol_Permiso
    const rolPermisoData = [
        // Administrador
        { id_rol: 1, id_permiso: 1 }, { id_rol: 1, id_permiso: 2 }, { id_rol: 1, id_permiso: 3 },
        { id_rol: 1, id_permiso: 4 }, { id_rol: 1, id_permiso: 5 }, { id_rol: 1, id_permiso: 6 },
        { id_rol: 1, id_permiso: 7 }, { id_rol: 1, id_permiso: 8 }, { id_rol: 1, id_permiso: 9 },
        { id_rol: 1, id_permiso: 10 }, { id_rol: 1, id_permiso: 11 }, { id_rol: 1, id_permiso: 12 },
        { id_rol: 1, id_permiso: 13 }, { id_rol: 1, id_permiso: 14 }, { id_rol: 1, id_permiso: 15 },
        { id_rol: 1, id_permiso: 16 }, { id_rol: 1, id_permiso: 17 }, { id_rol: 1, id_permiso: 18 },
        { id_rol: 1, id_permiso: 19 }, { id_rol: 1, id_permiso: 20 }, { id_rol: 1, id_permiso: 21 },
        { id_rol: 1, id_permiso: 22 },
        // Productor
        { id_rol: 2, id_permiso: 5 }, { id_rol: 2, id_permiso: 6 }, { id_rol: 2, id_permiso: 7 },
        { id_rol: 2, id_permiso: 8 }, { id_rol: 2, id_permiso: 9 }, { id_rol: 2, id_permiso: 10 },
        { id_rol: 2, id_permiso: 11 }, { id_rol: 2, id_permiso: 12 }, { id_rol: 2, id_permiso: 13 },
        { id_rol: 2, id_permiso: 22 },
        // Pasante
        { id_rol: 3, id_permiso: 6 }, { id_rol: 3, id_permiso: 9 }, { id_rol: 3, id_permiso: 11 },
        { id_rol: 3, id_permiso: 12 }, { id_rol: 3, id_permiso: 22 },
        // Invitado
        { id_rol: 4, id_permiso: 1 }, { id_rol: 4, id_permiso: 8 }, { id_rol: 4, id_permiso: 9 },
        { id_rol: 4, id_permiso: 10 },
    ]
    for (const rp of rolPermisoData) {
        await prisma.rol_Permiso.upsert({
            where: { id_rol_id_permiso: { id_rol: rp.id_rol, id_permiso: rp.id_permiso } },
            update: {},
            create: rp,
        })
    }

    // 🔹 Crear TIPO_ACCION
    const tipoAccionData = [
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
    ]
    for (const ta of tipoAccionData) {
        await prisma.tipoAccion.upsert({
            where: { id_tipo_accion: ta.id_tipo_accion },
            update: ta,
            create: ta,
        })
    }

    // 🔹 Crear TIPO_CAMBIO
    const tipoCambioData = [
        { id_tipo_cambio: 100, nombre_cambio: 'ACTUALIZAR_TITULO' },
        { id_tipo_cambio: 101, nombre_cambio: 'ACTUALIZAR_DESCRIPCION' },
        { id_tipo_cambio: 102, nombre_cambio: 'ACTUALIZAR_PRODUCTOR' },
        { id_tipo_cambio: 103, nombre_cambio: 'ACTUALIZAR_CATEGORIA' },
        { id_tipo_cambio: 104, nombre_cambio: 'ASIGNAR_ETIQUETA' },
        { id_tipo_cambio: 105, nombre_cambio: 'REMOVER_ETIQUETA' },
    ]
    for (const tc of tipoCambioData) {
        await prisma.tipoCambio.upsert({
            where: { id_tipo_cambio: tc.id_tipo_cambio },
            update: tc,
            create: tc,
        })
    }

    console.log('✅ Seed completo cargado')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
