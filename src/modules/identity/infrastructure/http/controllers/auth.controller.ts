import { SignInUseCase } from '@modules/identity/application/use-cases/sign-in.use-case';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignInDto } from '../dto/sign-in-request.dto';
import { Public } from '@shared/auth/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly signInUseCase: SignInUseCase) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: SignInDto): Promise<{ access_token: string }> {
    const token = await this.signInUseCase.execute(body.username, body.password);
    return token;
  }
}
