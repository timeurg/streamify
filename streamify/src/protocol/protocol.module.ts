import {
  BadRequestException,
  Logger,
  Module,
  Provider,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InjectionToken, ProtocolAdaptor, ProtocolAdaptorConstructor, ProtocolErrors } from './protocol';
import { StdProtocolAdaptor } from './impl/std';
import { FileProtocolAdaptor } from './impl/file';
import { NatsProtocolAdaptor } from './impl/nats';
import * as util from 'node:util';
import { parseConnectionString } from '../common/helpers/connection-string';
import { LoggerModule } from '../common/logger.module';

const classMap: {
  [key: string]: Partial<ProtocolAdaptor> & ProtocolAdaptorConstructor;
} = {
  std: StdProtocolAdaptor,
  file: FileProtocolAdaptor,
  nats: NatsProtocolAdaptor,
};

const infrastructure: Provider[] = [
  {
    provide: InjectionToken.ProtocolAdaptor_FACTORY,
    inject: [Logger],
    useFactory: function (logger: Logger) {
      return {
        create(connectionString: string): ProtocolAdaptor {
          const { protocol, connectionOptions } =
            parseConnectionString(connectionString);
          if (!classMap[protocol]) {
            throw new BadRequestException(
              util.format(ProtocolErrors.UNKNOWN_PROTOCOL, protocol),
            );
          }

          return new classMap[protocol](connectionOptions, { logger });
        },
      };
    },
  },
];

@Module({
  imports: [LoggerModule, CqrsModule],
  providers: [...infrastructure,],
  exports: [...infrastructure,],
})
export class ProtocolModule {}
