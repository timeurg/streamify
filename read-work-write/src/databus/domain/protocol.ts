import { Readable, Writable } from "node:stream";
import { DataBusType } from "./databus";
import { Observable } from "rxjs";

export interface ProtocolAdaptorConstructor {
    new(connectionString: string);
}

export interface ProtocolAdaptor {
    connect(mode: DataBusType): Promise<void>;
    disconnect(): Promise<void>;
    getStream(mode: DataBusType): Readable | Writable;
    state(): Observable<'BUSY'|'READY'>;
}

export interface ProtocolAdaptorFactory {
    create(connectionString: string): ProtocolAdaptor;
}