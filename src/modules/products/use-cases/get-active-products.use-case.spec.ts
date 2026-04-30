import { beforeAll, describe, jest, it, expect, afterEach } from '@jest/globals';
import { Test } from '@nestjs/testing';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '../../../domain/repositories/product.repository';
import { GetActiveProductsUseCase } from './get-active-products.use-case';
import { ProductsFetchException } from '../../../common/exceptions/product-fetch.exception';
import { Product } from '../../../domain/entities/product.entity';
import Big from 'big.js';

describe('Products - findAllActive', () => {
  let useCase: GetActiveProductsUseCase;
  let findAllActive: jest.MockedFunction<IProductRepository['findAllActive']>;

  beforeAll(async () => {
    findAllActive = jest.fn() as jest.MockedFunction<IProductRepository['findAllActive']>;
    const mockRepo: IProductRepository = {
      findAllActive,
      findById: jest.fn<(id: string) => Promise<Product | null>>(),
      findAllByBusinessUnit: jest.fn<(businessUnitId: string) => Promise<Product[]>>(),
    };

    const module = await Test.createTestingModule({
      providers: [
        GetActiveProductsUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get(GetActiveProductsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return active products', async () => {
    const mockProduct: Product = new Product(
      'uuid-1',
      'Tapioca',
      null,
      new Big('12.50'),
      true,
      'category-uuid-1',
      new Date(),
      new Date(),
    );

    findAllActive.mockResolvedValue([mockProduct]);
    const data = await useCase.execute();
    expect(data).toStrictEqual([mockProduct]);
  });

  it('should returns empty array', async () => {
    findAllActive.mockResolvedValue([]);
    const data = await useCase.execute();
    expect(data).toStrictEqual([]);
  });

  it('should throws error', async () => {
    findAllActive.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute()).rejects.toThrow(ProductsFetchException);
  });
});
