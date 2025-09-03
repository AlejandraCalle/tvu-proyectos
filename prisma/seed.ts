import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // const hashedPassword = await bcrypt.hash('8326547TVU*', 10);

  // await prisma.usuario.create({
  //   data: {
  //     nombre: 'Admin',
  //     apellido: 'TVU',
  //     correo: 'admin@tvu.com',
  //     contraseña: hashedPassword,
  //     estado: true,
  //     id_rol: 1, // rol administrador ya debe existir en la tabla Rol
  //   },
  // });

  // console.log('Admin creado correctamente');


  await prisma.categoria.createMany({
    data: [
      { nombre_categoria: 'Noticias', descripcion: 'Videos de noticias' },
      { nombre_categoria: 'Deportes', descripcion: 'Videos deportivos' },
      { nombre_categoria: 'Cultura', descripcion: 'Videos culturales' },
    ],
  });
  console.log('Categorías creadas correctamente');

  await prisma.productor.createMany({
    data: [
      { nombre_productor: 'TVU Noticias', contacto: 'contacto@tvu.com' },
      { nombre_productor: 'TVU Deportes', contacto: 'deportes@tvu.com' },
    ],
  });
  console.log('Productores creados correctamente');

  await prisma.etiqueta.createMany({
    data: [
      { nombre_etiqueta: 'Urgente' },
      { nombre_etiqueta: 'Importante' },
      { nombre_etiqueta: 'Cultural' },
    ],
  });
  console.log('Etiquetas creadas correctamente');
}



main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
