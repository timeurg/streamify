import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await CommandFactory.runWithoutClosing(
    AppModule, 
  );
}

bootstrap();