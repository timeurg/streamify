import { Inject, Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import {
  DataBus,
  DataBusProperties,
  DataBusType,
} from './databus';

export type CreateDataBusOptions = Readonly<{
  connectionString: string;
  mode: DataBusType;
}>;

export interface DataBusFactory {
  create(options: CreateDataBusOptions): DataBus;
}

// @Injectable()
// export class DataBusFactory {
//   @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

//   create(options: CreateDataBusOptions): DataBus {  
//     return this.eventPublisher.mergeObjectContext(
//       new DataBusImplement({
//         ...options
//       }),
//     );
//   }

//   reconstitute(properties: DataBusProperties): DataBus {
//     return this.eventPublisher.mergeObjectContext(
//       new DataBusImplement(properties),
//     );
//   }
// }