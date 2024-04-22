import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await CommandFactory.runWithoutClosing(AppModule, ['error','warn','verbose']);
}

bootstrap();
process.on('exit',() => console.log('exit', new Date()))