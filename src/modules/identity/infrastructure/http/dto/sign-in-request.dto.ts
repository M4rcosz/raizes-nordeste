import { IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
