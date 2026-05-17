import { Module } from '@nestjs/common';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { BusinessUnitsModule } from '@modules/business-units/business-units.module';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from '@modules/identity/identity.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@shared/auth/auth.guard';
import { GlobalErrorFilter } from '@shared/filter/global-error.filter';

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
    {
      provide: APP_FILTER,
      useClass: GlobalErrorFilter,
    },
  ],
})
export class AppModule {}
