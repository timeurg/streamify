import { DataBusImplement, DataBusTypeMap } from "src/databus/domain/databus";

export class StdDataBus extends DataBusImplement {
    getStream<T extends keyof DataBusTypeMap>(type: T): DataBusTypeMap[T] {
        throw new Error("Method not implemented.");
    }
    connect(purpose: keyof DataBusTypeMap): Promise<void> {
        throw new Error("Method not implemented.");
    }

}