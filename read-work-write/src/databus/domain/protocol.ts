import { Readable, Writable } from "node:stream";
import { DataBusType } from "./databus";

export interface ProtocolAdaptorConstructor {
    new(connectionString: string);
}

export interface ProtocolAdaptor {
    connect(mode: DataBusType): Promise<void>;
    getStream(mode: DataBusType): Readable | Writable;
}

export interface ProtocolAdaptorFactory {
    create(connectionString: string): ProtocolAdaptor;
}