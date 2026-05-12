import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { BusinessUnitsModule } from '@modules/business-units/business-units.module';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from '@modules/identity/identity.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@shared/auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BusinessUnitsModule,
    IdentityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
