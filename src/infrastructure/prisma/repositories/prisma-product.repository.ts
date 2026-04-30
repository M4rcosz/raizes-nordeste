import { Injectable } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository';
import { PrismaService } from '../prisma.service';
import { Product } from '../../../domain/entities/product.entity';
import type { Products as PrismaProduct } from '@prisma/client';
import Big from 'big.js';
import { DatabaseException } from '../../../common/exceptions/database.exception';

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
    return items.map((item) => this.toEntity(item.product));
  }

  async findAllActive(): Promise<Product[]> {
    try {
      const raws = await this.prisma.products.findMany({
        where: { isActive: true },
      });
      return raws.map((raw) => this.toEntity(raw));
    } catch (err) {
      throw new DatabaseException('Failed to fetch active products', err);
    }
  }

  private toEntity(raw: PrismaProduct): Product {
    const basePrice = new Big(raw.basePrice.toString());
    return new Product(
      raw.id,
      raw.name,
      raw.description,
      basePrice,
      raw.isActive,
      raw.categoryId,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
