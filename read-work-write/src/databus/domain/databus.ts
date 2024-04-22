import { AggregateRoot } from '@nestjs/cqrs';
import { Readable, Writable } from 'stream';

export interface DataBusTypeMap {
  "input": Readable;
  "output": Writable;
}
export type DataBusType = keyof DataBusTypeMap;

export type DataBusEssentialProperties = Readonly<
  Required<{
    connectionString: DataBusType;
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

export abstract class DataBus extends AggregateRoot implements DataBusInterface, DataBusStreamMode<DataBusTypeMap,DataBusType> {
  protected connectionString: string;
  public readonly mode: DataBusType;

  constructor(properties: DataBusProperties) {
    super();
    Object.assign(this, properties);
    this.autoCommit = true;
  };

  abstract getStream(): Readable | Writable;

  abstract connect(): Promise<void>;
}