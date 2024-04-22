import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await CommandFactory.runWithoutClosing(
    AppModule, 
    new Logger('main'),
  );
}

bootstrap();
process.on('exit',() => console.log('exit', new Date()))