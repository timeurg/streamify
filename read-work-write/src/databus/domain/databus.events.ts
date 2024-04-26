import { IEvent } from '@nestjs/cqrs';
import { DataBus } from './databus';
import { Readable, Writable } from 'node:stream';

export class DataBusConnectStartEvent implements IEvent {
  constructor(public dataBus: DataBus) {}
}

export class DataBusConnectSuccessEvent implements IEvent {
  constructor(public dataBus: DataBus) {}
}

export class DataBusStreamCreatedEvent implements IEvent {
  constructor(
    public dataBus: DataBus,
    public stream: Readable | Writable,
  ) {}
}
