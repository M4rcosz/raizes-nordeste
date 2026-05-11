import argon from 'argon2';

const ARGON_OPTIONS = {
  type: argon.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return await argon.hash(password, ARGON_OPTIONS);
}
