import { DataBus, DataBusTypeMap } from "src/databus/domain/databus";

export class StdDataBus extends DataBus {
    getStream<T extends keyof DataBusTypeMap>(): DataBusTypeMap[T] {
        throw new Error("Method not implemented.");
    }
    connect(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}