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

process.on('SIGINT', function() {
  console.log('SIGINT exit');
  process.exit();
}); 
process.on('SIGTERM', function() {
  console.log('SIGTERM exit');
  process.exit();
});
process.on('exit', () => console.log('Exited', new Date()));