import { Inject, Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import {
  DataBus,
  DataBusImplement,
  DataBusProperties,
} from './databus';

export type CreateDataBusOptions = Readonly<{
  connectionString: string;
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