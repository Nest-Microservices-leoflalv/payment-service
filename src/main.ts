import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Payment-service');

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  await app.listen(envs.PORT);

  logger.log(`Application is running on: ${envs.PORT}`);
}
bootstrap();
