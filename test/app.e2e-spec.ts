import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import type { PaginatedResponseDto } from '@shared/pagination/paginated-response.dto';
import type { ProductResponseDto } from '@modules/business-units/infrastructure/http/dto/product-response.dto';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/products', () => {
    it('should return 200 with a paginated envelope of active products', async () => {
      const response: { body: PaginatedResponseDto<ProductResponseDto> } = await request(server)
        .get('/api/products')
        .expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toEqual(
        expect.objectContaining({
          limit: expect.any(Number),
          hasMore: expect.any(Boolean),
        }),
      );
    });
  });

  describe('GET /api/products/:productId', () => {
    it('should return 404 when the product does not exist', async () => {
      await request(server).get('/api/products/00000000-0000-0000-0000-000000000000').expect(404);
    });
  });

  describe('GET /api/products/by-business-unit/:businessUnitId', () => {
    it('should return 200 with an empty paginated envelope for an unknown business unit', async () => {
      const response: { body: PaginatedResponseDto<ProductResponseDto> } = await request(server)
        .get('/api/products/by-business-unit/00000000-0000-0000-0000-000000000000')
        .expect(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta).toEqual(
        expect.objectContaining({ hasMore: false, nextCursor: null }),
      );
    });
  });
});
