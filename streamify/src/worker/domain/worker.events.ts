import { IEvent } from '@nestjs/cqrs';
import { Worker } from './worker';

export class WorkerConnectStarted implements IEvent {
  constructor(
    public input: string,
    public output: string,
  ) {}
}

export class WorkerReadyEvent implements IEvent {
  constructor(public worker: Worker) {}
}
