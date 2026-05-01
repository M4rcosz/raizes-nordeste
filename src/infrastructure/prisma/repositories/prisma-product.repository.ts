import { Injectable } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository';
import { PrismaService } from '../prisma.service';
import { Product } from '../../../domain/entities/product.entity';
import type { Products as PrismaProduct } from '@prisma/client';
import Big from 'big.js';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const raw = await this.prisma.products.findUnique({ where: { id } });
    if (!raw) {
      return null;
    }
    return this.toEntity(raw);
  }

  async findAllByBusinessUnit(businessUnitId: string): Promise<Product[]> {
    const items = await this.prisma.businessUnitMenuItems.findMany({
      where: { businessUnitId, isAvailable: true },
      include: { product: true },
    });
    return items.map((item) => {
      const price = item.customPrice
        ? new Big(item.customPrice.toString())
        : new Big(item.product.basePrice.toString());
      return new Product(
        item.product.id,
        item.product.name,
        item.product.description,
        price,
        item.product.isActive,
        item.product.categoryId,
        item.product.createdAt,
        item.product.updatedAt,
      );
    });
  }

  async findAllActive(): Promise<Product[]> {
    const raws = await this.prisma.products.findMany({
      where: { isActive: true },
    });
    return raws.map((raw) => this.toEntity(raw));
  }

  private toEntity(raw: PrismaProduct): Product {
    const price = new Big(raw.basePrice.toString());
    return new Product(
      raw.id,
      raw.name,
      raw.description,
      price,
      raw.isActive,
      raw.categoryId,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
