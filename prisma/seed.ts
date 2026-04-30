import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const unit = await prisma.businessUnits.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      name: 'Matriz',
      cnpj: '00.000.000/0001-00',
      address: 'Rua X, 123',
      city: 'Uberlândia',
      phone: '(34) 99999-9999',
      isActive: true,
    },
  });

  await prisma.users.upsert({
    where: { email: 'admin@raizes.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@raizes.com',
      password_hash: 'trocar_depois',
      role: 'ADMIN',
      businessUnitId: unit.id,
      isActive: true,
    },
  });

  const acaiCategory = await prisma.categories.upsert({
    where: { name: 'Açaí' },
    update: {},
    create: {
      name: 'Açaí',
      description: 'Categoria de açaí',
    },
  });

  await prisma.products.upsert({
    where: { name: 'Açaí Fitness' },
    update: {},
    create: {
      categoryId: acaiCategory.id,
      name: 'Açaí Fitness',
      basePrice: 20.5,
      imageUrl: '@example.com',
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
