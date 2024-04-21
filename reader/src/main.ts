import { CommandFactory } from 'nest-commander';
import { ReaderAppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(ReaderAppModule);
}

bootstrap();