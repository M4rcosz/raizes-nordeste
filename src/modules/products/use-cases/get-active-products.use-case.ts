import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type IProductRepository,
} from '../../../domain/repositories/product.repository';
import { ProductsFetchException } from '../../../common/exceptions/product-fetch.exception';
import { Product } from '../../../domain/entities/product.entity';

@Injectable()
export class GetActiveProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: IProductRepository,
  ) {}

  async execute(): Promise<Product[]> {
    try {
      return await this.products.findAllActive();
    } catch (err) {
      throw new ProductsFetchException(`Could not retrieve active products \n Error: ${err}`);
    }
  }
}
