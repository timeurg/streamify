import { Inject, Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import {
  DataBus,
  DataBusProperties,
  DataBusType,
} from './databus';
import { InjectionToken } from '../application/injection-tokens';
import { ProtocolAdaptorFactory } from './protocol';

export type CreateDataBusOptions = Readonly<{
  connectionString: string;
  mode: DataBusType;
}>;

// export interface DataBusFactory {
//   create(options: CreateDataBusOptions): DataBus;
// }

@Injectable()
export class DataBusFactory {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;
  @Inject(InjectionToken.ProtocolAdaptor_FACTORY) private transportFactory: ProtocolAdaptorFactory;

  create(options: CreateDataBusOptions): DataBus {  
    return this.eventPublisher.mergeObjectContext(
      new DataBus(
        { ...options },
        this.transportFactory.create(options.connectionString),
      ),
    );
  }

  reconstitute(properties: DataBusProperties): DataBus {
    return this.eventPublisher.mergeObjectContext(
      new DataBus(properties, this.transportFactory.create(properties.connectionString),),
    );
  }
}