import { Controller, Get, Param } from '@nestjs/common';
import { GetActiveProductsUseCase } from './use-cases/get-active-products.use-case';
import { ProductResponseDto } from './dto/product-response.dto';
import { GetAllProductsByBusinessUnitUseCase } from './use-cases/get-products-by-business-unit.use-case';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly getActiveProducts: GetActiveProductsUseCase,
    private readonly getProductsByBusinessUnit: GetAllProductsByBusinessUnitUseCase,
  ) {}

  @Get()
  async findActive(): Promise<ProductResponseDto[]> {
    const products = await this.getActiveProducts.execute();
    return products.map((product) => ProductResponseDto.fromEntity(product));
  }

  @Get('by-business-unit/:businessUnitId')
  async findByBusinessUnit(
    @Param('businessUnitId') businessUnitId: string,
  ): Promise<ProductResponseDto[]> {
    const products = await this.getProductsByBusinessUnit.execute(businessUnitId);
    return products.map((product) => ProductResponseDto.fromEntity(product));
  }
}
