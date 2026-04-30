import { Product } from '../entities/product.entity';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAllByBusinessUnit(businessUnitId: string): Promise<Product[]>;
  findAllActive(): Promise<Product[]>;
}

export const PRODUCT_REPOSITORY = Symbol('ProductRepository');
