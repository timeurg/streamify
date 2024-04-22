import { Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import {
  Worker,
  WorkerImplement,
  WorkerProperties,
} from './worker';

export type CreateWorkerOptions = Readonly<{
  input: string;
  output: string;
  options?: unknown;
  workload?: string[];
}>;

export class WorkerFactory {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

  create(options: CreateWorkerOptions): Worker {  
    return this.eventPublisher.mergeObjectContext(
      new WorkerImplement({
        ...options
      }),
    );
  }

  reconstitute(properties: WorkerProperties): Worker {
    return this.eventPublisher.mergeObjectContext(
      new WorkerImplement(properties),
    );
  }
}
