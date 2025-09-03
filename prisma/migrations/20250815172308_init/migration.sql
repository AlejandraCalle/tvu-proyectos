-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contraseña" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "public"."Rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "public"."Permiso" (
    "id_permiso" SERIAL NOT NULL,
    "nombre_permiso" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id_permiso")
);

-- CreateTable
CREATE TABLE "public"."Rol_Permiso" (
    "id_rol" INTEGER NOT NULL,
    "id_permiso" INTEGER NOT NULL,

    CONSTRAINT "Rol_Permiso_pkey" PRIMARY KEY ("id_rol","id_permiso")
);

-- CreateTable
CREATE TABLE "public"."AsignacionRolPermiso" (
    "id_rol" INTEGER NOT NULL,
    "id_permiso" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL,
    "asignado_por" INTEGER NOT NULL,

    CONSTRAINT "AsignacionRolPermiso_pkey" PRIMARY KEY ("id_rol","id_permiso","asignado_por")
);

-- CreateTable
CREATE TABLE "public"."RegistroAcciones" (
    "id_accion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_tipo_accion" INTEGER NOT NULL,
    "entidad_afectada" TEXT NOT NULL,
    "id_entidad" INTEGER NOT NULL,
    "fecha_accion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroAcciones_pkey" PRIMARY KEY ("id_accion")
);

-- CreateTable
CREATE TABLE "public"."TipoAccion" (
    "id_tipo_accion" SERIAL NOT NULL,
    "nombre_accion" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "TipoAccion_pkey" PRIMARY KEY ("id_tipo_accion")
);

-- CreateTable
CREATE TABLE "public"."HistorialCambios" (
    "id_historial" SERIAL NOT NULL,
    "id_video" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_tipo_cambio" INTEGER NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL,
    "detalle_cambio" TEXT NOT NULL,

    CONSTRAINT "HistorialCambios_pkey" PRIMARY KEY ("id_historial")
);

-- CreateTable
CREATE TABLE "public"."TipoCambio" (
    "id_tipo_cambio" SERIAL NOT NULL,
    "nombre_cambio" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "TipoCambio_pkey" PRIMARY KEY ("id_tipo_cambio")
);

-- CreateTable
CREATE TABLE "public"."Etiqueta" (
    "id_etiqueta" SERIAL NOT NULL,
    "nombre_etiqueta" TEXT NOT NULL,

    CONSTRAINT "Etiqueta_pkey" PRIMARY KEY ("id_etiqueta")
);

-- CreateTable
CREATE TABLE "public"."AsignacionVideoEtiqueta" (
    "id_video" INTEGER NOT NULL,
    "id_etiqueta" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL,
    "asignado_por" INTEGER NOT NULL,

    CONSTRAINT "AsignacionVideoEtiqueta_pkey" PRIMARY KEY ("id_video","id_etiqueta","asignado_por")
);

-- CreateTable
CREATE TABLE "public"."Video_Etiqueta" (
    "id_video" INTEGER NOT NULL,
    "id_etiqueta" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_Etiqueta_pkey" PRIMARY KEY ("id_video","id_etiqueta")
);

-- CreateTable
CREATE TABLE "public"."Video" (
    "id_video" SERIAL NOT NULL,
    "código_único" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_creación" TIMESTAMP(3) NOT NULL,
    "id_productor" INTEGER NOT NULL,
    "id_categoria" INTEGER NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id_video")
);

-- CreateTable
CREATE TABLE "public"."Productor" (
    "id_productor" SERIAL NOT NULL,
    "nombre_productor" TEXT NOT NULL,
    "contacto" TEXT,

    CONSTRAINT "Productor_pkey" PRIMARY KEY ("id_productor")
);

-- CreateTable
CREATE TABLE "public"."Categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nombre_categoria" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "public"."Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Video_código_único_key" ON "public"."Video"("código_único");

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "public"."Rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rol_Permiso" ADD CONSTRAINT "Rol_Permiso_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "public"."Rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rol_Permiso" ADD CONSTRAINT "Rol_Permiso_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "public"."Permiso"("id_permiso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AsignacionRolPermiso" ADD CONSTRAINT "AsignacionRolPermiso_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "public"."Rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AsignacionRolPermiso" ADD CONSTRAINT "AsignacionRolPermiso_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "public"."Permiso"("id_permiso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AsignacionRolPermiso" ADD CONSTRAINT "AsignacionRolPermiso_asignado_por_fkey" FOREIGN KEY ("asignado_por") REFERENCES "public"."Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistroAcciones" ADD CONSTRAINT "RegistroAcciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RegistroAcciones" ADD CONSTRAINT "RegistroAcciones_id_tipo_accion_fkey" FOREIGN KEY ("id_tipo_accion") REFERENCES "public"."TipoAccion"("id_tipo_accion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistorialCambios" ADD CONSTRAINT "HistorialCambios_id_video_fkey" FOREIGN KEY ("id_video") REFERENCES "public"."Video"("id_video") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistorialCambios" ADD CONSTRAINT "HistorialCambios_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistorialCambios" ADD CONSTRAINT "HistorialCambios_id_tipo_cambio_fkey" FOREIGN KEY ("id_tipo_cambio") REFERENCES "public"."TipoCambio"("id_tipo_cambio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AsignacionVideoEtiqueta" ADD CONSTRAINT "AsignacionVideoEtiqueta_id_video_fkey" FOREIGN KEY ("id_video") REFERENCES "public"."Video"("id_video") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AsignacionVideoEtiqueta" ADD CONSTRAINT "AsignacionVideoEtiqueta_id_etiqueta_fkey" FOREIGN KEY ("id_etiqueta") REFERENCES "public"."Etiqueta"("id_etiqueta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AsignacionVideoEtiqueta" ADD CONSTRAINT "AsignacionVideoEtiqueta_asignado_por_fkey" FOREIGN KEY ("asignado_por") REFERENCES "public"."Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Video_Etiqueta" ADD CONSTRAINT "Video_Etiqueta_id_video_fkey" FOREIGN KEY ("id_video") REFERENCES "public"."Video"("id_video") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Video_Etiqueta" ADD CONSTRAINT "Video_Etiqueta_id_etiqueta_fkey" FOREIGN KEY ("id_etiqueta") REFERENCES "public"."Etiqueta"("id_etiqueta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_id_productor_fkey" FOREIGN KEY ("id_productor") REFERENCES "public"."Productor"("id_productor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Video" ADD CONSTRAINT "Video_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "public"."Categoria"("id_categoria") ON DELETE RESTRICT ON UPDATE CASCADE;
