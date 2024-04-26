import { Inject, Logger } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Worker, WorkerImplement, WorkerProperties } from './worker';

export type CreateWorkerOptions = Readonly<{
  input: string;
  output: string;
  options?: unknown;
  workload?: string[];
}>;

export class WorkerFactory {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;
  @Inject() private logger: Logger;

  private instance: Worker;

  get(options?: CreateWorkerOptions): Worker {
    if (!this.instance) {
      this.instance = this.create(options);
    }
    return this.instance;
  }

  private create(options: CreateWorkerOptions): Worker {
    return this.eventPublisher.mergeObjectContext(
      new WorkerImplement(
        {
          ...options,
        },
        this.logger,
      ),
    );
  }

  private reconstitute(properties: WorkerProperties): Worker {
    return this.eventPublisher.mergeObjectContext(
      new WorkerImplement(properties, this.logger),
    );
  }
}
