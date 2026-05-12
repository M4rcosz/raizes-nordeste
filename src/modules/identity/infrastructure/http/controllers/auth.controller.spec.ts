import { afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { SignInUseCase } from '../../../application/use-cases/sign-in.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let signInUseCase: jest.Mocked<SignInUseCase>;

  beforeAll(async () => {
    signInUseCase = { execute: jest.fn() } as unknown as jest.Mocked<SignInUseCase>;

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: SignInUseCase, useValue: signInUseCase }],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call SignInUseCase with credentials and return its result', async () => {
      signInUseCase.execute.mockResolvedValue({ access_token: 'jwt.token' });

      const result = await controller.login({ username: 'panic', password: 'password1' });

      expect(signInUseCase.execute).toHaveBeenCalledWith('panic', 'password1');
      expect(result).toEqual({ access_token: 'jwt.token' });
    });

    it('should propagate errors raised by the use case', async () => {
      const error = new Error('boom');
      signInUseCase.execute.mockRejectedValue(error);

      await expect(controller.login({ username: 'panic', password: 'password1' })).rejects.toBe(
        error,
      );
    });
  });
});
