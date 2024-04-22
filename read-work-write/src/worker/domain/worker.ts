import { AggregateRoot } from '@nestjs/cqrs';

export type WorkerEssentialProperties = Readonly<
  Required<{
    input: string;
    output: string;
  }>
>;

export type WorkerOptionalProperties = Readonly<
  Partial<{
    workload: string[];
  }>
>;

export type WorkerProperties = WorkerEssentialProperties &
  WorkerOptionalProperties;

export interface Worker {
  connect: () => void;
}

export class WorkerImplement extends AggregateRoot implements Worker {

    constructor(properties: WorkerProperties) {
      super();
      Object.assign(this, properties);
    }

    connect(): void {
    };
}