import { Readable, Writable } from "node:stream";
import { Observable, Subject } from "rxjs";
import { DataBusTypeMap } from "src/databus/domain/databus";
import { ProtocolAdaptor } from "src/databus/domain/protocol";

export class NatsProtocolAdaptor implements ProtocolAdaptor {

    private stream: Readable | Writable;
    private state$: Subject<'BUSY'|'READY'> = new Subject();

    constructor(connectionString: string) {
    }
    
    connect(mode: keyof DataBusTypeMap): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    getStream(mode: keyof DataBusTypeMap): Readable | Writable {
        throw new Error("Method not implemented.");
    }    

    state(): Observable<'BUSY'|'READY'> {
        return this.state$.asObservable();
    }
}