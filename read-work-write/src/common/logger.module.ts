import { ConsoleLogger, Logger, Module } from '@nestjs/common';
import { CommonInjectionTokens } from './injection-tokens';

@Module({
  providers: [{
    provide: Logger,
    useValue: new ConsoleLogger(),
  }, {
    provide: CommonInjectionTokens.App_Logger,
    useExisting: Logger,
  }],
  exports: [Logger, CommonInjectionTokens.App_Logger],
})
export class LoggerModule {}