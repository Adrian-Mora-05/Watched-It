import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ZodValidationPipe } from 'nestjs-zod'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // base url for all routes
  app.useGlobalPipes(new ZodValidationPipe()); // global validation pipe using Zod
  await app.listen(3000);
}
bootstrap();
