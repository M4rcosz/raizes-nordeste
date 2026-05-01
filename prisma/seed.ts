import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  // =======================================================
  // BUSINESS UNITS
  // =======================================================
  const unit1 = await prisma.businessUnits.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      id: 'e36e29da-52ae-49af-ab40-5f1e8b61c8a1', // uuid static for api tests
      name: 'Matriz',
      cnpj: '00.000.000/0001-00',
      address: 'Rua X, 123',
      city: 'Uberlândia',
      phone: '34999999999',
      isActive: true,
    },
  });

  const unit2 = await prisma.businessUnits.upsert({
    where: { cnpj: '00.000.000/0002-00' },
    update: {},
    create: {
      name: 'Matriz 2',
      cnpj: '00.000.000/0002-00',
      address: 'Rua Z, 987',
      city: 'São Paulo',
      phone: '11999999999',
      isActive: true,
    },
  });

  // =======================================================
  // USERS
  // =======================================================
  await prisma.users.upsert({
    where: { email: 'admin1@raizes.com' },
    update: {},
    create: {
      name: 'Admin 1',
      email: 'admin1@raizes.com',
      password_hash: 'pass1',
      role: 'ADMIN',
      businessUnitId: unit1.id,
      isActive: true,
    },
  });

  await prisma.users.upsert({
    where: { email: 'admin2@raizes.com' },
    update: {},
    create: {
      name: 'Admin 2',
      email: 'admin2@raizes.com',
      password_hash: 'pass2',
      role: 'ADMIN',
      businessUnitId: unit2.id,
      isActive: true,
    },
  });

  // =======================================================
  // CATEGORIES
  // =======================================================
  const acaiCategory = await prisma.categories.upsert({
    where: { name: 'Açaí' },
    update: {},
    create: {
      name: 'Açaí',
      description: 'Açaí Category',
    },
  });

  const beverageCategory = await prisma.categories.upsert({
    where: { name: 'Beverage' },
    update: {},
    create: {
      name: 'Beverage',
      description: 'Beverage Category',
    },
  });

  // =======================================================
  // PRODUCTS
  // =======================================================
  const prod1 = await prisma.products.upsert({
    where: { name: 'Açaí Fitness' },
    update: {},
    create: {
      categoryId: acaiCategory.id,
      name: 'Açaí Fitness',
      basePrice: 20.5,
      imageUrl: '@example1.com',
    },
  });

  const prod2 = await prisma.products.upsert({
    where: { name: 'Lemon Juice' },
    update: {},
    create: {
      categoryId: beverageCategory.id,
      name: 'Lemon Juice',
      basePrice: 10,
      imageUrl: '@example2.com',
    },
  });

  const prod3 = await prisma.products.upsert({
    where: { name: 'Grape Juice' },
    update: {},
    create: {
      categoryId: beverageCategory.id,
      name: 'Grape Juice',
      basePrice: 9.7,
      imageUrl: '@example2.com',
    },
  });

  // =======================================================
  // BUSINESS UNIT MENU ITEMS
  // =======================================================
  await prisma.businessUnitMenuItems.upsert({
    where: { businessUnitId_productId: { businessUnitId: unit1.id, productId: prod1.id } },
    update: {},
    create: {
      businessUnitId: unit1.id,
      productId: prod1.id,
      customPrice: 22.3,
      isAvailable: true,
    },
  });

  await prisma.businessUnitMenuItems.upsert({
    where: { businessUnitId_productId: { businessUnitId: unit1.id, productId: prod2.id } },
    update: {},
    create: {
      businessUnitId: unit1.id,
      productId: prod2.id,
      customPrice: 12.3,
      isAvailable: true,
    },
  });

  await prisma.businessUnitMenuItems.upsert({
    where: { businessUnitId_productId: { businessUnitId: unit2.id, productId: prod2.id } },
    update: {},
    create: {
      businessUnitId: unit2.id,
      productId: prod2.id,
      customPrice: 9.7,
      isAvailable: true,
    },
  });

  await prisma.businessUnitMenuItems.upsert({
    where: { businessUnitId_productId: { businessUnitId: unit2.id, productId: prod3.id } },
    update: {},
    create: {
      businessUnitId: unit2.id,
      productId: prod3.id,
      customPrice: 12.3,
      isAvailable: true,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
