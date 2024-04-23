import { Inject, Injectable } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';
import { Readable, Writable } from 'stream';
import { InjectionToken } from '../application/injection-tokens';
import { DataBusConnectStartEvent, DataBusConnectSuccessEvent, DataBusStreamCreatedEvent } from './databus.events';
import { ProtocolAdaptor, ProtocolAdaptorFactory } from './protocol';

export interface DataBusTypeMap {
  "input": Readable;
  "output": Writable;
}
export type DataBusType = keyof DataBusTypeMap;

export type DataBusEssentialProperties = Readonly<
  Required<{
    connectionString: string;
    mode: DataBusType;
  }>
>;

export type DataBusOptionalProperties = Readonly<
  Partial<{
  }>
>;

export type DataBusProperties = DataBusEssentialProperties &
  Required<DataBusOptionalProperties>;

// looks good, doesn't work
export type DataBusStreamMode<U, T extends keyof U> = {
  mode: T;
  getStream(): U[T];
}

export interface DataBusInterface {
  connect: () => Promise<void>;
}

@Injectable()
export class DataBus extends AggregateRoot implements DataBusInterface, DataBusStreamMode<DataBusTypeMap,DataBusType> {
  protected connectionString: string;
  public readonly mode: DataBusType;
  private stream: Readable | Writable;

  constructor(
    properties: DataBusProperties, 
    private transport: ProtocolAdaptor
  ) {
    super();
    Object.assign(this, properties);
  };

  getStream(): Readable | Writable {
    this.stream = this.transport.getStream(this.mode);
    this.apply(new DataBusStreamCreatedEvent(this, this.stream))
    return this.stream;
  };

  async connect(): Promise<void> {
    this.autoCommit = true;
    this.apply(new DataBusConnectStartEvent(this));
    await this.transport.connect(this.mode);
    this.apply(new DataBusConnectSuccessEvent(this));
    return;
  };
}