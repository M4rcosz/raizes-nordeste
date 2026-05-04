import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  // =======================================================
  // BUSINESS UNITS
  // =======================================================
  const unit1 = await prisma.businessUnit.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      id: 'e36e29da-52ae-49af-ab40-5f1e8b61c8a1', // uuid static for api tests
      name: 'Rainbow Flavors - Uberlândia',
      cnpj: '00.000.000/0001-00',
      address: 'Street X, 123',
      city: 'Uberlândia',
      phone: '34999999999',
      isActive: true,
    },
  });

  const unit2 = await prisma.businessUnit.upsert({
    where: { cnpj: '00.000.000/0002-00' },
    update: {},
    create: {
      name: 'Ark Drinks - Araguari',
      cnpj: '00.000.000/0002-00',
      address: 'Street Z, 987',
      city: 'Araguari',
      phone: '34999999998',
      isActive: true,
    },
  });

  // =======================================================
  // USERS
  // =======================================================
  await prisma.user.upsert({
    where: { email: 'r6-squad@raizes.com' },
    update: {},
    create: {
      name: 'Pedro Panic',
      email: 'r6-squad@raizes.com',
      passwordHash: 'vaulted-pass',
      role: 'KITCHEN',
      businessUnitId: unit1.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin-tribes@raizes.com' },
    update: {},
    create: {
      name: 'Everton Steve Jobs',
      email: 'admin-tribes@raizes.com',
      passwordHash: 'vaulted-pass',
      role: 'ADMIN',
      businessUnitId: unit2.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'chief@raizes.com' },
    update: {},
    create: {
      name: 'Gustavo Player',
      email: 'chief@raizes.com',
      passwordHash: 'pass2',
      role: 'MANAGER',
      businessUnitId: unit2.id,
      isActive: true,
    },
  });

  // =======================================================
  // CATEGORIES
  // =======================================================
  const acaiCategory = await prisma.category.upsert({
    where: { name: 'Açaí' },
    update: {},
    create: {
      name: 'Açaí',
      description: 'Açaí Category',
    },
  });

  const beverageCategory = await prisma.category.upsert({
    where: { name: 'Beverage' },
    update: {},
    create: {
      id: 'ab24d105-6abe-4cab-bf39-bffd8c8cdabd', // uuid static for api tests
      name: 'Beverage',
      description: 'Beverage Category',
    },
  });

  const chickenCategory = await prisma.category.upsert({
    where: { name: 'Chicken' },
    update: {},
    create: {
      name: 'Chicken',
      description: 'Chicken Category',
    },
  });

  // =======================================================
  // PRODUCTS
  // =======================================================
  const prod1 = await prisma.product.upsert({
    where: { name: 'Açaí Fitness' },
    update: {},
    create: {
      id: 'cebe6acf-e54e-4842-a8ec-eda9a439ceb5', // uuid static for api tests
      categoryId: acaiCategory.id,
      name: 'Açaí Fitness',
      basePrice: 20.5,
      imageUrl: '@example1.com',
    },
  });

  const prod2 = await prisma.product.upsert({
    where: { name: 'Lemon Juice' },
    update: {},
    create: {
      categoryId: beverageCategory.id,
      name: 'Lemon Juice',
      basePrice: 10,
      imageUrl: '@example2.com',
    },
  });

  const prod3 = await prisma.product.upsert({
    where: { name: 'Grape Juice' },
    update: {},
    create: {
      categoryId: beverageCategory.id,
      name: 'Grape Juice',
      basePrice: 9.7,
      imageUrl: '@example3.com',
    },
  });
  const prod4 = await prisma.product.upsert({
    where: { name: 'Chicken Stroganoff' },
    update: {},
    create: {
      categoryId: chickenCategory.id,
      name: 'Chicken Stroganoff',
      basePrice: 20.0,
      imageUrl: '@example4.com',
    },
  });

  // =======================================================
  // BUSINESS UNIT MENU ITEMS
  // =======================================================
  await prisma.businessUnitMenuItem.upsert({
    where: { businessUnitId_productId: { businessUnitId: unit1.id, productId: prod1.id } },
    update: {},
    create: {
      businessUnitId: unit1.id,
      productId: prod1.id,
      customPrice: 22.3,
      isAvailable: true,
    },
  });

  await prisma.businessUnitMenuItem.upsert({
    where: { businessUnitId_productId: { businessUnitId: unit1.id, productId: prod2.id } },
    update: {},
    create: {
      businessUnitId: unit1.id,
      productId: prod2.id,
      customPrice: 12.3,
      isAvailable: true,
    },
  });

  await prisma.businessUnitMenuItem.upsert({
    where: { businessUnitId_productId: { businessUnitId: unit2.id, productId: prod2.id } },
    update: {},
    create: {
      businessUnitId: unit2.id,
      productId: prod2.id,
      customPrice: 9.7,
      isAvailable: true,
    },
  });

  await prisma.businessUnitMenuItem.upsert({
    where: { businessUnitId_productId: { businessUnitId: unit2.id, productId: prod3.id } },
    update: {},
    create: {
      businessUnitId: unit2.id,
      productId: prod3.id,
      customPrice: 11.3,
      isAvailable: true,
    },
  });
  await prisma.businessUnitMenuItem.upsert({
    where: { businessUnitId_productId: { businessUnitId: unit2.id, productId: prod4.id } },
    update: {},
    create: {
      businessUnitId: unit2.id,
      productId: prod4.id,
      customPrice: 23.3,
      isAvailable: true,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
