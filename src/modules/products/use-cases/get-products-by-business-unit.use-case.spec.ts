import { beforeAll, describe, expect, it, jest, afterEach } from '@jest/globals';
import { GetAllProductsByBusinessUnitUseCase } from './get-products-by-business-unit.use-case';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '../../../domain/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';
import { Test } from '@nestjs/testing';
import Big from 'big.js';
import { ProductsFetchException } from '../../../common/exceptions/product-fetch.exception';

describe('GetAllProductsByBusinessUnitUseCase', () => {
  describe('execute', () => {
    let useCase: GetAllProductsByBusinessUnitUseCase;
    let findAllByBusinessUnit: jest.MockedFunction<IProductRepository['findAllByBusinessUnit']>;

    beforeAll(async () => {
      findAllByBusinessUnit = jest.fn() as jest.MockedFunction<
        IProductRepository['findAllByBusinessUnit']
      >;
      const mockRepo = {
        findAllActive: jest.fn(),
        findById: jest.fn(),
        findAllByBusinessUnit,
      } as jest.Mocked<IProductRepository>;

      const module = await Test.createTestingModule({
        providers: [
          GetAllProductsByBusinessUnitUseCase,
          {
            provide: PRODUCT_REPOSITORY,
            useValue: mockRepo,
          },
        ],
      }).compile();

      useCase = module.get(GetAllProductsByBusinessUnitUseCase);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return products', async () => {
      const mockProduct: Product = new Product(
        'uuid-1',
        'Açaí',
        null,
        new Big('12.50'),
        true,
        'category-uuid-1',
        new Date(),
        new Date(),
      );

      findAllByBusinessUnit.mockResolvedValue([mockProduct]);
      const data = await useCase.execute('bu-id');
      expect(findAllByBusinessUnit).toHaveBeenCalledWith('bu-id');
      expect(data).toStrictEqual([mockProduct]);
    });

    it('should return an empty array', async () => {
      findAllByBusinessUnit.mockResolvedValue([]);
      const data = await useCase.execute('bu-id');
      expect(data).toStrictEqual([]);
    });

    it('should throw an error', async () => {
      findAllByBusinessUnit.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute('bu-id')).rejects.toThrow(ProductsFetchException);
      await expect(useCase.execute('bu-id')).rejects.toThrow('DB error');
    });
  });
});
