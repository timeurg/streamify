import { DataBus, DataBusStreamMode, DataBusType, DataBusTypeMap } from "src/databus/domain/databus";
import { constants, promises as fs} from 'node:fs';
import { dirname } from 'node:path'
import { OnModuleDestroy } from "@nestjs/common";
import { Readable, Writable } from "node:stream";

export class FileDataBus extends DataBus implements OnModuleDestroy, DataBusStreamMode<DataBusTypeMap,DataBusType>  {
    private fileHandle: fs.FileHandle;
    private stream: Readable | Writable;

    async connect(): Promise<void> {
        switch (this.mode) {
            case "input":
                this.fileHandle = await fs.open(this.connectionString, 'r');
                return;
            case "output":
                this.fileHandle = await fs.open(this.connectionString, 'w');
                return;
            default:
                break;
        }
        throw new Error("FileDataBus connect failed.");
    }

    getStream(): Readable | Writable {
        if (!this.fileHandle) {
            throw new Error("FileDataBus getting stream before connect.");
        }
        switch (this.mode) {
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
        console.log(FileDataBus.name, 'destroy')
        if (this.fileHandle) {
            this.fileHandle.close()
        }
    }

}