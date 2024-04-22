import { Module, Provider, Scope } from '@nestjs/common';
import * as handlers from './application/handlers';
import { CqrsModule } from '@nestjs/cqrs';
import { DataBusSagas } from './application/databus.saga';
import { DataBusFactory } from './domain/databus.factory';
import { DataBusDomainService } from './domain/databus.service';
import { InjectionToken } from 'src/databus/application/injection-tokens';
import { DataBusFactoryImplement } from './infrastructure/databus.factory.implement';

const infrastructure: Provider[] = [
  {
    provide: InjectionToken.DataBus_FACTORY,
    useClass: DataBusFactoryImplement,
    scope: Scope.TRANSIENT,
  },
];

const application = [
  ...Object.values(handlers),
  DataBusSagas,
];

const domain = [
  DataBusDomainService,
];

@Module({
  imports: [CqrsModule],
  exports: [...infrastructure],
  providers: [ ...infrastructure, ...application, ...domain],
})
export class DataBusModule {}
