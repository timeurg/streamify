import { Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import {
  Reader,
  ReaderImplement,
  ReaderProperties,
} from './reader';

type CreateReaderOptions = Readonly<{
}>;

export class ReaderFactory {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

  create(options: CreateReaderOptions): Reader {  
    return this.eventPublisher.mergeObjectContext(
      new ReaderImplement({
        ...options
      }),
    );
  }

  reconstitute(properties: ReaderProperties): Reader {
    return this.eventPublisher.mergeObjectContext(
      new ReaderImplement(properties),
    );
  }
}
