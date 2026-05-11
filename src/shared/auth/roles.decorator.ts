import { UserRole } from '@modules/identity/domain/value-objects/user-role';
import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<UserRole[]>();
