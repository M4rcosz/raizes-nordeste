import { afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { SignInUseCase } from './sign-in.use-case';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { IPasswordHasher, PASSWORD_HASHER } from '../../domain/ports/password-hasher.port';
import { ITokenSigner, TOKEN_SIGNER } from '../../domain/ports/token-signer.port';
import { User } from '../../domain/entities/user.entity';
import { UsersFetchError } from '../errors/users-fetch.error';

describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let findByUsername: jest.MockedFunction<IUserRepository['findByUsername']>;
  let verify: jest.MockedFunction<IPasswordHasher['verify']>;
  let sign: jest.MockedFunction<ITokenSigner['sign']>;

  const buildUser = (overrides?: { id?: string; passwordHash?: string }): User =>
    new User(
      overrides?.id ?? 'user-1',
      'bu-1',
      'panic',
      'Pedro Panic',
      'panic@example.com',
      overrides?.passwordHash ?? 'real-hash',
      null,
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-02T00:00:00Z'),
      null,
      'KITCHEN',
      true,
    );

  beforeAll(async () => {
    findByUsername = jest.fn() as jest.MockedFunction<IUserRepository['findByUsername']>;
    verify = jest.fn() as jest.MockedFunction<IPasswordHasher['verify']>;
    sign = jest.fn() as jest.MockedFunction<ITokenSigner['sign']>;

    const userRepo: jest.Mocked<IUserRepository> = { findByUsername };
    const passwordHasher: jest.Mocked<IPasswordHasher> = {
      hash: jest.fn() as jest.MockedFunction<IPasswordHasher['hash']>,
      verify,
    };
    const tokenSigner: jest.Mocked<ITokenSigner> = { sign };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SignInUseCase,
        { provide: USER_REPOSITORY, useValue: userRepo },
        { provide: PASSWORD_HASHER, useValue: passwordHasher },
        { provide: TOKEN_SIGNER, useValue: tokenSigner },
      ],
    }).compile();

    useCase = moduleRef.get(SignInUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return access_token on valid credentials', async () => {
      findByUsername.mockResolvedValue(buildUser({ id: 'user-1' }));
      verify.mockResolvedValue(true);
      sign.mockResolvedValue('signed.jwt.token');

      const result = await useCase.execute('panic', 'plain-password');

      expect(findByUsername).toHaveBeenCalledWith('panic');
      expect(verify).toHaveBeenCalledWith('real-hash', 'plain-password');
      expect(sign).toHaveBeenCalledWith({
        sub: 'user-1',
        username: 'panic',
        role: 'KITCHEN',
      });
      expect(result).toEqual({ access_token: 'signed.jwt.token' });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      findByUsername.mockResolvedValue(buildUser());
      verify.mockResolvedValue(false);

      await expect(useCase.execute('panic', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
      expect(sign).not.toHaveBeenCalled();
    });

    it('should still call hasher when user does not exist (timing-safe) and throw UnauthorizedException', async () => {
      findByUsername.mockResolvedValue(null);
      verify.mockResolvedValue(false);

      await expect(useCase.execute('ghost', 'whatever')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(verify).toHaveBeenCalledTimes(1);
      expect(verify).toHaveBeenCalledWith(null, 'whatever');
      expect(sign).not.toHaveBeenCalled();
    });

    it('should wrap repository failure in UsersFetchError with cause', async () => {
      const dbError = new Error('DB down');
      findByUsername.mockRejectedValue(dbError);

      await expect(useCase.execute('panic', 'plain')).rejects.toBeInstanceOf(UsersFetchError);
      await expect(useCase.execute('panic', 'plain')).rejects.toMatchObject({ cause: dbError });
    });
  });
});
