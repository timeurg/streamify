import {
  BadRequestException,
  Logger,
  Module,
  Provider,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DataBusFactory } from './domain/databus.factory';
import { DataBusDomainService } from './domain/databus.service';
import { InjectionToken } from 'src/databus/application/injection-tokens';
import {
  GetDataBusCommandHandler,
  GetDataBusStreamCommandHandler,
} from './application/handlers';
import { ProtocolAdaptor, ProtocolAdaptorConstructor } from './domain/protocol';
import { StdProtocolAdaptor } from './infrastructure/protocols/std';
import { FileProtocolAdaptor } from './infrastructure/protocols/file';
import { NatsProtocolAdaptor } from './infrastructure/protocols/nats';
import { parseConnectionString } from 'src/common/helpers/connection-string';
import * as util from 'node:util';
import { DataBusErrors } from './errors';
import { LoggerModule } from 'src/common/logger.module';

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
              util.format(DataBusErrors.UNKNOWN_PROTOCOL, protocol),
            );
          }

          return new classMap[protocol](connectionOptions, { logger });
        },
      };
    },
  },
];

const application = [
  GetDataBusCommandHandler,
  GetDataBusStreamCommandHandler,
];

const domain = [DataBusDomainService, DataBusFactory];

@Module({
  imports: [LoggerModule, CqrsModule],
  providers: [...infrastructure, ...application, ...domain],
})
export class DataBusModule {}
