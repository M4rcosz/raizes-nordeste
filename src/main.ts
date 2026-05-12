import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors(); // TODO: Configure CORS properly for production
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe());

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  logger.log(`Application running on http://localhost:${port}/api`);
}

void bootstrap();
