import { Product } from '../entities/product.entity';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  /**
   * Returns available products for a business unit.
   * Each product's `price` reflects the unit's `customPrice` when set,
   * falling back to the product's base price otherwise.
   */
  findAllByBusinessUnit(businessUnitId: string): Promise<Product[]>;
  findAllActive(): Promise<Product[]>;
}

export const PRODUCT_REPOSITORY = Symbol('ProductRepository');
