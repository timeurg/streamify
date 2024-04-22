import { IEvent } from '@nestjs/cqrs';
import { Worker } from './worker';

export class WorkerConnectStarted implements IEvent {
  constructor(public input: string, public output: string) {
    console.log(WorkerConnectStarted.name, input, output);
  }
}