import { AggregateRoot } from '@nestjs/cqrs';

export type ReaderEssentialProperties = Readonly<object>;

export type ReaderOptionalProperties = Readonly<Partial<object>>;

export type ReaderProperties = ReaderEssentialProperties &
  Required<ReaderOptionalProperties>;

export interface Reader {
  connect: () => void;
}

export class ReaderImplement extends AggregateRoot implements Reader {
  constructor(properties: ReaderProperties) {
    super();
    Object.assign(this, properties);
  }

  connect(): void {}
}
