import { AggregateRoot } from '@nestjs/cqrs';
import { Readable, Writable } from 'stream';

export type DataBusEssentialProperties = Readonly<
  Required<{
    connectionString: string;
  }>
>;

export type DataBusOptionalProperties = Readonly<
  Partial<{
  }>
>;

export type DataBusProperties = DataBusEssentialProperties &
  Required<DataBusOptionalProperties>;

export interface DataBusTypeMap {
  "input": Readable;
  "output": Writable;
}

export type DataBusType = keyof DataBusTypeMap;

export interface DataBus {
  connect: (purpose: DataBusType) => Promise<void>;
  getStream: <T extends DataBusType>(type: T) => DataBusTypeMap[T];
}

export abstract class DataBusImplement extends AggregateRoot implements DataBus {
  protected connectionString: string;

  constructor(properties: DataBusProperties) {
    super();
    Object.assign(this, properties);
  };

  abstract getStream<T extends DataBusType>(type: T): DataBusTypeMap[T];

  abstract connect(purpose: DataBusType): Promise<void>;
}