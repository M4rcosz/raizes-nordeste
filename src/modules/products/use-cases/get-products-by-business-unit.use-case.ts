import { Inject, Injectable } from '@nestjs/common';
import {
  type IProductRepository,
  PRODUCT_REPOSITORY,
} from '../../../domain/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import { ProductsFetchException } from '../../../common/exceptions/product-fetch.exception';

@Injectable()
export class GetAllProductsByBusinessUnitUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: IProductRepository,
  ) {}

  async execute(businessUnitId: string): Promise<Product[]> {
    try {
      return await this.products.findAllByBusinessUnit(businessUnitId);
    } catch (err) {
      throw new ProductsFetchException(
        `Could not retrieve products by business unit. Error: ${err}`,
      );
    }
  }
}
