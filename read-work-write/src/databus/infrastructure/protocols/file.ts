import { DataBus, DataBusStreamMode, DataBusType, DataBusTypeMap } from "src/databus/domain/databus";
import { constants, promises as fs} from 'node:fs';
import { dirname } from 'node:path'
import { OnModuleDestroy } from "@nestjs/common";
import { Readable, Writable } from "node:stream";
import { DataBusConnectStartEvent, DataBusConnectSuccessEvent, DataBusStreamCreatedEvent } from "src/databus/domain/databus.events";
import { ProtocolAdaptor } from "src/databus/domain/protocol";
import { BehaviorSubject, Observable, Subject } from "rxjs";

export class FileProtocolAdaptor implements OnModuleDestroy, ProtocolAdaptor  {
    private fileHandle: fs.FileHandle;
    private stream: Readable | Writable;

    constructor(private connectionString: string) {
    };

    async connect(mode: keyof DataBusTypeMap): Promise<void> {
        switch (mode) {
            case "input":
                this.fileHandle = await fs.open(this.connectionString, 'r');
                return;
            case "output":
                this.fileHandle = await fs.open(this.connectionString, 'w');
                return;
            default:
                break;
        }
        throw new Error("FileProtocolAdaptor: file open failed.");
    }

    getStream(mode: keyof DataBusTypeMap): Readable | Writable {
        if (!this.fileHandle) {
            throw new Error("FileProtocolAdaptor: getting stream before connect.");
        }
        switch (mode) {
            case "input":
                this.stream = this.fileHandle.createReadStream();
                break;
            case "output":
                this.stream = this.fileHandle.createWriteStream();
                break;
            default:
                throw new Error("FileDataBus unknown mode");
        }
        return this.stream;
    }


    onModuleDestroy() {
        if (this.fileHandle) {
            this.fileHandle.close()
        }
    }
    
    disconnect(): Promise<void> {
        return;
    }
    
    private state$: Subject<'BUSY'|'READY'> = new BehaviorSubject('READY');
    state(): Observable<"BUSY" | "READY"> {
        return this.state$.asObservable();
    }

}