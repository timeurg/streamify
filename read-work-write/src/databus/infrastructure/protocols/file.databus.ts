import { DataBusImplement, DataBusTypeMap } from "src/databus/domain/databus";
import { constants, promises as fs} from 'node:fs';

export class FileDataBus extends DataBusImplement {
    getStream<T extends keyof DataBusTypeMap>(type: T): DataBusTypeMap[T] {
        throw new Error("Method not implemented.");
    }
    connect(purpose: keyof DataBusTypeMap): Promise<void> {
        switch (purpose) {
            case "input":
                return fs.access(this.connectionString, constants.R_OK)
            case "output":
                return fs.access(this.connectionString, constants.W_OK)
            default:
                break;
        }
        throw new Error("FileDataBus connect failed.");
    }

}