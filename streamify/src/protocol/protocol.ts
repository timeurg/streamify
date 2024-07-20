import { Readable, Writable } from 'node:stream';
import { Observable } from 'rxjs';
import { LoggerService } from '@nestjs/common';
export enum InjectionToken {
  ProtocolAdaptor_FACTORY = 'ProtocolAdaptorFactory',
}
export enum ProtocolErrors {
  UNKNOWN_PROTOCOL = 'Protocol [%s] unknown',
  PROTOCOL_PREMATURE_GETSTREAM = 'Protocol [%s] error: use connect() before getStream()',
}

export type InOut = 'input' | 'output';


export type ProtocolInjectables = {
  logger: LoggerService;
};

export interface ProtocolAdaptorConstructor {
  new (connectionString: string, dependenies?: ProtocolInjectables);
}

export interface ProtocolAdaptor {
  connect(mode: InOut): Promise<void>;
  disconnect(): Promise<void>;
  getStream(): Readable | Writable;
  state(): Observable<'BUSY' | 'READY'>;
}

export interface ProtocolAdaptorFactory {
  create(connectionString: string): ProtocolAdaptor;
}
