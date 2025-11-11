-- AlterTable
ALTER TABLE "public"."Video" ADD COLUMN     "duracion_segundos" INTEGER,
ADD COLUMN     "formato" TEXT,
ADD COLUMN     "nombre_archivo" TEXT,
ADD COLUMN     "ruta_archivo" TEXT,
ADD COLUMN     "tamaño_bytes" BIGINT;
