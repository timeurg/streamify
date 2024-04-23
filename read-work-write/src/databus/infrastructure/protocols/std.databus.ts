import { Readable, Writable } from "node:stream";
import { DataBus, DataBusTypeMap } from "src/databus/domain/databus";
import { DataBusConnectSuccessEvent, DataBusStreamCreatedEvent } from "src/databus/domain/databus.events";

export class StdDataBus extends DataBus {
    private stream: Readable | Writable;
    getStream(): Readable | Writable {
        this.stream = this.mode == 'input' ? process.stdin : process.stdout;
        this.apply(new DataBusStreamCreatedEvent(this, this.stream));
        return this.stream;
    }
    connect(): Promise<void> {
        this.apply(new DataBusConnectSuccessEvent(this));
        return;
    }

}