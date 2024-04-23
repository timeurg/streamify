import { Module, Provider, Scope } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DataBusSagas } from './application/databus.saga';
import { DataBusFactory } from './domain/databus.factory';
import { DataBusDomainService } from './domain/databus.service';
import { InjectionToken } from 'src/databus/application/injection-tokens';
import { ProtocolAdaptorFactoryImplement } from './infrastructure/protocol-adaptor.factory';
import { GetDataBusCommandHandler, GetDataBusStreamCommandHandler } from './application/handlers';

const infrastructure: Provider[] = [
  {
    provide: InjectionToken.ProtocolAdaptor_FACTORY,
    useClass: ProtocolAdaptorFactoryImplement,
  },
];

const application = [
  GetDataBusCommandHandler,
  GetDataBusStreamCommandHandler,
  DataBusSagas,
];

const domain = [
  DataBusDomainService,
  DataBusFactory,
  // {
  //   provide: InjectionToken.DataBus_FACTORY,
  //   useClass: DataBusFactory,
  // },
];

@Module({
  imports: [CqrsModule],
  providers: [ ...infrastructure, ...application, ...domain],
})
export class DataBusModule {}
