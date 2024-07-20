import {
  Module,
  Provider,
} from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DataBusFactory } from './domain/databus.factory';
import { DataBusDomainService } from './domain/databus.service';
import {
  GetDataBusCommandHandler,
  GetDataBusStreamCommandHandler,
} from './application/handlers';
import { LoggerModule } from 'src/common/logger.module';
import { ProtocolModule } from 'src/protocol/protocol.module';

const infrastructure: Provider[] = [
];

const application = [
  GetDataBusCommandHandler,
  GetDataBusStreamCommandHandler,
];

const domain = [DataBusDomainService, DataBusFactory];

@Module({
  imports: [LoggerModule, CqrsModule, ProtocolModule],
  providers: [...infrastructure, ...application, ...domain],
})
export class DataBusModule {}
