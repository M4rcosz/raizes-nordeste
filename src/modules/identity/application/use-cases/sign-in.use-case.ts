import { User } from '@modules/identity/domain/entities/user.entity';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@modules/identity/domain/repositories/user.repository';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersFetchError } from '../errors/users-fetch.error';
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '@modules/identity/domain/ports/password-hasher.port';
import { type ITokenSigner, TOKEN_SIGNER } from '@modules/identity/domain/ports/token-signer.port';

@Injectable()
export class SignInUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(TOKEN_SIGNER)
    private readonly tokenSigner: ITokenSigner,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(username: string, plainPassword: string): Promise<{ access_token: string }> {
    let user: User | null;

    try {
      user = await this.users.findByUsername(username);
    } catch (err) {
      throw new UsersFetchError('Could not retrieve user.', { cause: err });
    }

    const isValid = await User.verifyPasswordOrDecoy(user, plainPassword, this.passwordHasher);

    if (!isValid || !user) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = await this.tokenSigner.sign(payload);

    return { access_token: token };
  }
}
