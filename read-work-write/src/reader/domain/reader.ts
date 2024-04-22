import { AggregateRoot } from '@nestjs/cqrs';

export type ReaderEssentialProperties = Readonly<
  Required<{
  }>
>;

export type ReaderOptionalProperties = Readonly<
  Partial<{
  }>
>;

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

    connect(): void {
    };
}