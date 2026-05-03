import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import { PrismaProductRepository } from '../../infrastructure/prisma/repositories/prisma-product.repository';
import { ProductsController } from './products.controller';
import { GetActiveProductsUseCase } from './use-cases/get-active-products.use-case';
import { GetProductsByBusinessUnitUseCase } from './use-cases/get-products-by-business-unit.use-case';
import { GetProductByIdUseCase } from './use-cases/get-product-by-id.use-case';

@Module({
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    GetActiveProductsUseCase,
    GetProductsByBusinessUnitUseCase,
    GetProductByIdUseCase,
  ],
})
export class ProductsModule {}
