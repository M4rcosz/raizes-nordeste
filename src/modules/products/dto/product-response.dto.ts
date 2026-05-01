import { Product } from '../../../domain/entities/product.entity';

export class ProductResponseDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly isActive: boolean,
    public readonly categoryId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromEntity(product: Product): ProductResponseDto {
    return new ProductResponseDto(
      product.id,
      product.name,
      product.description,
      product.price.toNumber(),
      product.isActive,
      product.categoryId,
      product.createdAt,
      product.updatedAt,
    );
  }
}
