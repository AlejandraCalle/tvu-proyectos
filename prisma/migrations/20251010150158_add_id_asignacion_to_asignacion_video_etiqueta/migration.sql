/*
  Warnings:

  - The primary key for the `AsignacionVideoEtiqueta` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "public"."AsignacionVideoEtiqueta" DROP CONSTRAINT "AsignacionVideoEtiqueta_pkey",
ADD COLUMN     "id_asignacion" SERIAL NOT NULL,
ADD CONSTRAINT "AsignacionVideoEtiqueta_pkey" PRIMARY KEY ("id_asignacion");
