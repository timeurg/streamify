import { Injectable, LoggerService } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';
import { Readable, Writable } from 'node:stream';
import { DataBusType, DataBusTypeMap } from 'src/databus/domain/databus';
import { WorkerConnectStarted, WorkerReadyEvent } from './worker.events';

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
  startTransfer(): void;
  connect: () => void;
  setStream(mode: DataBusType, stream: Writable | Readable): void;
}

@Injectable()
export class WorkerImplement extends AggregateRoot implements Worker {
  private readonly input: string;
  private readonly output: string;
  private readonly workload: string[];
  private input_: Readable;
  private output_: Writable;

  constructor(
    properties: WorkerProperties,
    private logger: LoggerService,
  ) {
    super();
    Object.assign(this, properties);
    this.logger.verbose(
      `Starting worker: ${properties.input} ${properties.output} ${properties.workload}`,
    );
    this.autoCommit = true;
  }

  connect(): void {
    this.apply(new WorkerConnectStarted(this.input, this.output));
  }

  setStream(mode: keyof DataBusTypeMap, stream: Writable | Readable): void {
    if (mode == 'input') {
      this.input_ = stream as Readable;
    } else {
      this.output_ = stream as Writable;
    }
    if (this.input_ && this.output_) {
      this.apply(new WorkerReadyEvent(this));
    }
  }

  startTransfer(): void {
    this.input_.pipe(this.output_);
  }
}
