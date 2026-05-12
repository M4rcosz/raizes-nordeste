import { UserRole } from '@modules/identity/domain/value-objects/user-role';

export type JwtPayloadSign = { sub: string; username: string; role: UserRole };

export interface JwtPayload extends JwtPayloadSign {
  iat: number; // issued at (UNIX seconds)
  exp: number; // expiration (UNIX seconds)
}
