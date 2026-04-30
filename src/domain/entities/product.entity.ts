import { Big } from 'big.js';

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly basePrice: Big,
    public readonly isActive: boolean,
    public readonly categoryId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isAvailable(): boolean {
    return this.isActive;
  }
}
