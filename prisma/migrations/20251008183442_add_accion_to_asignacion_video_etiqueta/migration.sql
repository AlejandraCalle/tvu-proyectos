/*
  Warnings:

  - Added the required column `accion` to the `AsignacionVideoEtiqueta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AsignacionVideoEtiqueta" ADD COLUMN     "accion" VARCHAR(10) NOT NULL;
