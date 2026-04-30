import { Controller, Get } from '@nestjs/common';
import { GetActiveProductsUseCase } from './use-cases/get-active-products.use-case';
import { ProductResponseDto } from './dto/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly getActiveProducts: GetActiveProductsUseCase) {}

  @Get()
  async findActive(): Promise<ProductResponseDto[]> {
    const products = await this.getActiveProducts.execute();
    return products.map((product) => ProductResponseDto.fromEntity(product));
  }
}
