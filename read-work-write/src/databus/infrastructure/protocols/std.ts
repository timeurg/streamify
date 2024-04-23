import { Readable, Writable } from "node:stream";
import { DataBus, DataBusTypeMap } from "src/databus/domain/databus";
import { DataBusConnectSuccessEvent, DataBusStreamCreatedEvent } from "src/databus/domain/databus.events";
import { ProtocolAdaptor } from "src/databus/domain/protocol";

export class StdProtocolAdaptor implements ProtocolAdaptor {

    constructor(connectionString: string) {
    };
    
    connect(mode: keyof DataBusTypeMap): Promise<void> {
        return;
    }
    getStream(mode: keyof DataBusTypeMap): Readable | Writable {
        this.stream = mode == 'input' ? process.stdin : process.stdout;
        return this.stream;
    }
    private stream: Readable | Writable;

}