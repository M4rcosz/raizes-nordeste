import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { ProductsFetchException } from '../../../common/exceptions/product-fetch.exception';
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from '../../../domain/repositories/product.repository';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: IProductRepository,
  ) {}

  async execute(productId: string): Promise<Product> {
    let product: Product | null;

    try {
      product = await this.products.findById(productId);
    } catch (err) {
      throw new ProductsFetchException(`Could not retrieve product by id "${productId}".`, {
        cause: err,
      });
    }

    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found.`);
    }

    return product;
  }
}
