import { ICommand } from '@nestjs/cqrs';
import { Readable, Writable } from 'node:stream';
import { DataBus } from 'src/databus/domain/databus';
import { Worker } from '../domain/worker';

export class GetWorkerCommand implements ICommand {
  constructor(public input: string, public output: string, public workload: string[], public options: unknown) {
  }
}

export class AssignStreamCommand implements ICommand {
  constructor(public dataBus: DataBus, public stream: Readable | Writable) {
  }
}

export class StartTransferCommand implements ICommand {
  constructor(public worker: Worker) {
  }
}