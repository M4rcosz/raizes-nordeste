import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import { PrismaProductRepository } from '../../infrastructure/prisma/repositories/prisma-product.repository';
import { GetActiveProductsUseCase } from './use-cases/get-active-products.use-case';
import { ProductsController } from './products.controller';
import { GetAllProductsByBusinessUnitUseCase } from './use-cases/get-products-by-business-unit.use-case';

@Module({
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    GetActiveProductsUseCase,
    GetAllProductsByBusinessUnitUseCase,
  ],
  controllers: [ProductsController],
})
export class ProductsModule {}
