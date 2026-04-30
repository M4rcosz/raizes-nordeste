import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import { PrismaProductRepository } from '../../infrastructure/prisma/repositories/prisma-product.repository';
import { GetActiveProductsUseCase } from './use-cases/get-active-products.use-case';
import { ProductsController } from './products.controller';

@Module({
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    GetActiveProductsUseCase,
  ],
  controllers: [ProductsController],
})
export class ProductsModule {}
