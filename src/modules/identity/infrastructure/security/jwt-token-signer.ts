import { ITokenSigner } from '@modules/identity/domain/ports/token-signer.port';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadSign } from '@shared/auth/jwt-payload.type';

@Injectable()
export class JwtTokenSigner implements ITokenSigner {
  constructor(private readonly jwtService: JwtService) {}

  async sign(payload: JwtPayloadSign): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }
}
