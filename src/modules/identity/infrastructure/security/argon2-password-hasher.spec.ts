import { afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import argon from 'argon2';
import { Argon2PasswordHasher } from './argon2-password-hasher';

describe('Argon2PasswordHasher', () => {
  let hasher: Argon2PasswordHasher;

  beforeAll(() => {
    hasher = new Argon2PasswordHasher();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('hash + verify (round-trip)', () => {
    it('should produce a PHC hash that verifies the same password', async () => {
      const hash = await hasher.hash('correct-password');

      expect(hash).toMatch(/^\$argon2id\$/);
      await expect(hasher.verify(hash, 'correct-password')).resolves.toBe(true);
    });

    it('should return false for the wrong password', async () => {
      const hash = await hasher.hash('correct-password');

      await expect(hasher.verify(hash, 'wrong-password')).resolves.toBe(false);
    });
  });

  describe('verify with null hash (timing-safe decoy)', () => {
    it('should return false', async () => {
      await expect(hasher.verify(null, 'whatever')).resolves.toBe(false);
    });

    it('should still call argon.verify against a decoy hash to prevent user enumeration via timing', async () => {
      const verifySpy = jest.spyOn(argon, 'verify');

      await hasher.verify(null, 'whatever');

      expect(verifySpy).toHaveBeenCalledTimes(1);
      const [decoyHash] = verifySpy.mock.calls[0];
      expect(decoyHash).toMatch(/^\$argon2id\$/);
    });
  });

  describe('verify with malformed hash', () => {
    it('should return false instead of throwing when the stored hash is not a valid PHC string', async () => {
      await expect(hasher.verify('not-a-real-hash', 'whatever')).resolves.toBe(false);
    });
  });
});
