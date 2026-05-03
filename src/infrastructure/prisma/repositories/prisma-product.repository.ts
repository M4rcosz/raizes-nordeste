import { Injectable } from '@nestjs/common';
import type { Products as PrismaProduct, Prisma } from '@prisma/client';
import Big from 'big.js';
import {
  FindProductsByBusinessUnitInput,
  FindProductsInput,
  IProductRepository,
  ProductFilters,
} from '../../../domain/repositories/product.repository';
import { PrismaService } from '../prisma.service';
import { Product } from '../../../domain/entities/product.entity';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const raw = await this.prisma.products.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }

  async findAllActive(input: FindProductsInput): Promise<Product[]> {
    const { pagination, filters } = input;

    const raws = await this.prisma.products.findMany({
      where: {
        isActive: true,
        ...this.buildProductWhere(filters),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: pagination.take,
      ...(pagination.cursor && {
        cursor: { id: pagination.cursor },
        skip: 1,
      }),
    });

    return raws.map((raw) => this.toEntity(raw));
  }

  async findAllByBusinessUnit(input: FindProductsByBusinessUnitInput): Promise<Product[]> {
    const { businessUnitId, pagination, filters } = input;

    const items = await this.prisma.businessUnitMenuItems.findMany({
      where: {
        businessUnitId,
        isAvailable: true,
        product: this.buildProductWhere(filters),
      },
      include: { product: true },
      orderBy: [{ product: { createdAt: 'desc' } }, { productId: 'desc' }],
      take: pagination.take,
      ...(pagination.cursor && {
        cursor: {
          businessUnitId_productId: {
            businessUnitId,
            productId: pagination.cursor,
          },
        },
        skip: 1,
      }),
    });

    return items.map((item) => {
      const price = new Big((item.customPrice ?? item.product.basePrice).toString());
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

  private buildProductWhere(filters?: ProductFilters): Prisma.ProductsWhereInput {
    if (!filters) {
      return {};
    }
    const where: Prisma.ProductsWhereInput = {};
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    return where;
  }

  private toEntity(raw: PrismaProduct): Product {
    return new Product(
      raw.id,
      raw.name,
      raw.description,
      new Big(raw.basePrice.toString()),
      raw.isActive,
      raw.categoryId,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
