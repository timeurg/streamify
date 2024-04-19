import { NestFactory } from '@nestjs/core';
import { ReaderModule } from './reader.module';

async function bootstrap() {
  const app = await NestFactory.create(ReaderModule);
  await app.listen(3000);
}
bootstrap();
