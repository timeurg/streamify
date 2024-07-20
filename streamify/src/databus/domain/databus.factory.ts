import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { DataBus, DataBusProperties, DataBusType } from './databus';
import { InjectionToken, ProtocolAdaptorFactory } from 'src/protocol/protocol';

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
  @Inject(InjectionToken.ProtocolAdaptor_FACTORY)
  private transportFactory: ProtocolAdaptorFactory;
  @Inject() private logger: Logger;

  create(options: CreateDataBusOptions): DataBus {
    return this.eventPublisher.mergeObjectContext(
      new DataBus(
        { ...options },
        this.transportFactory.create(options.connectionString),
        this.logger,
      ),
    );
  }

  reconstitute(properties: DataBusProperties): DataBus {
    return this.eventPublisher.mergeObjectContext(
      new DataBus(
        properties,
        this.transportFactory.create(properties.connectionString),
        this.logger,
      ),
    );
  }
}
