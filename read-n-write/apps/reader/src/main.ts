import { NestFactory } from '@nestjs/core';
import { ReaderModule } from './reader.module';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(ReaderModule);
  app.enableShutdownHooks();
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
