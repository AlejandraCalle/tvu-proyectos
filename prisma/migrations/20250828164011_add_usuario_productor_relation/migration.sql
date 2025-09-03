/*
  Warnings:

  - A unique constraint covering the columns `[nombre_accion]` on the table `TipoAccion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre_cambio]` on the table `TipoCambio` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "id_productor" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "TipoAccion_nombre_accion_key" ON "public"."TipoAccion"("nombre_accion");

-- CreateIndex
CREATE UNIQUE INDEX "TipoCambio_nombre_cambio_key" ON "public"."TipoCambio"("nombre_cambio");

-- AddForeignKey
ALTER TABLE "public"."Usuario" ADD CONSTRAINT "Usuario_id_productor_fkey" FOREIGN KEY ("id_productor") REFERENCES "public"."Productor"("id_productor") ON DELETE SET NULL ON UPDATE CASCADE;
