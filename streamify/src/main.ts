import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await CommandFactory.runWithoutClosing(
    AppModule,
    ['test', 'production'].includes(process.env['NODE_ENV'])
      ? ['warn']
      : ['debug'],
  );
  const logger = app.get(Logger);
  process.on('SIGINT', function () {
    logger.log('SIGINT exit');
    process.exit();
  });
  process.on('SIGTERM', function () {
    logger.log('SIGTERM exit');
    process.exit();
  });
  process.on('exit', () => logger.log(`Exited ${new Date()}`));
}

bootstrap();
