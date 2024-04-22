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

interface DataBusTypeMap {
  "input": Readable;
  "output": Writable;
}

export type DataBusType = keyof DataBusTypeMap;

export interface DataBus {
  connect: (purpose: DataBusType) => Promise<void>;
  getStream: <T extends DataBusType>(type: T) => DataBusTypeMap[T];
}

export class DataBusImplement extends AggregateRoot implements DataBus {

  constructor(properties: DataBusProperties) {
    super();
    Object.assign(this, properties);
  }

  getStream: <T extends DataBusType>(type: T) => DataBusTypeMap[T];

  async connect(): Promise<void> {
  };
}