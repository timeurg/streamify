import { Injectable, LoggerService } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';
import { Readable, Writable } from 'stream';
import {
  DataBusConnectStartEvent,
  DataBusConnectSuccessEvent,
  DataBusStreamCreatedEvent,
} from './databus.events';
import { ProtocolAdaptor } from 'src/protocol/protocol';

export interface DataBusTypeMap {
  input: Readable;
  output: Writable;
}
export type DataBusType = keyof DataBusTypeMap;

export type DataBusEssentialProperties = Readonly<
  Required<{
    connectionString: string;
    mode: DataBusType;
  }>
>;

export type DataBusProperties = DataBusEssentialProperties;

// looks good, doesn't work
export type DataBusStreamMode<U, T extends keyof U> = {
  mode: T;
  getStream(): U[T];
};

export interface DataBusInterface {
  connect: () => Promise<void>;
}

@Injectable()
export class DataBus
  extends AggregateRoot
  implements DataBusInterface, DataBusStreamMode<DataBusTypeMap, DataBusType>
{
  protected connectionString: string;
  public readonly mode: DataBusType;
  private stream: Readable | Writable;

  constructor(
    properties: DataBusProperties,
    private transport: ProtocolAdaptor,
    private logger: LoggerService,
  ) {
    super();
    Object.assign(this, properties);
  }

  getStream(): Readable | Writable {
    this.stream = this.transport.getStream();
    this.apply(new DataBusStreamCreatedEvent(this, this.stream));
    return this.stream;
  }

  async connect(): Promise<void> {
    this.autoCommit = true;
    this.apply(new DataBusConnectStartEvent(this));
    try {
      await this.transport.connect(this.mode);
    } catch (error) {
      this.logger.error(error);
      // UnhandledExceptionBus doesn't catch anything for some reason, so
      process.exit(1);
    }

    this.apply(new DataBusConnectSuccessEvent(this));
    return;
  }
}
