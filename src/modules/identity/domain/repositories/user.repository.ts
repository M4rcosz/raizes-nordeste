import { User } from '../entities/user.entity';

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
