import { JwtPayloadSign } from '@shared/auth/jwt-payload.type';

export interface ITokenSigner {
  sign(payload: JwtPayloadSign): Promise<string>;
}

export const TOKEN_SIGNER = Symbol('TokenSigner');
