import { Inject, Logger } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { Worker, WorkerImplement, WorkerProperties } from './worker';
import { InjectionToken, TransformerFactory } from 'src/transformer/transformers';

export type CreateWorkerOptions = Readonly<{
  input: string;
  output: string;
  options?: unknown;
  workload?: string[];
}>;

export class WorkerFactory {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;
  @Inject() private logger: Logger;
  @Inject(InjectionToken.Tranformer_FACTORY) private transformerFactory: TransformerFactory;

  private instance: Worker;

  get(options?: CreateWorkerOptions): Worker {
    if (!this.instance) {
      this.instance = this.create(options);
    }
    return this.instance;
  }

  private create(createOptions: CreateWorkerOptions): Worker {
    const { input, output } = createOptions;
    const workload = createOptions.workload.map((code) =>
      this.transformerFactory.create(code),
    );
    return this.eventPublisher.mergeObjectContext(
      new WorkerImplement(
        {
          input,
          output,
          workload,
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
