import { parseConnectionString } from "src/common/helpers/connection-string";
import { DataBus, DataBusProperties, DataBusType } from "../domain/databus";
import { CreateDataBusOptions, DataBusFactory } from "../domain/databus.factory";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import * as util from 'node:util';
import { DataBusErrors } from "../errors";
import { AggregateRoot, EventPublisher } from "@nestjs/cqrs";
import { StdDataBus } from "./protocols/std.databus";
import { FileDataBus } from "./protocols/file.databus";

type DataBusImplementType = {
    new <T extends DataBus>(properties: DataBusProperties): T
}

@Injectable()
export class DataBusFactoryImplement implements DataBusFactory {
    private readonly classMap: {[key: string]: {new (properties: DataBusProperties)}} = {
        'std': StdDataBus,
        'file': FileDataBus,
    }
    
    @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

    create(options: CreateDataBusOptions): DataBus {
        let {protocol, connectionOptions} = parseConnectionString(options.connectionString);
        if (!this.classMap[protocol]) {
            throw new BadRequestException(util.format(DataBusErrors.UNKNOWN_PROTOCOL, protocol))
        }

        return this.eventPublisher.mergeObjectContext(
            new (this.classMap[protocol] as DataBusImplementType)({ mode: options.mode, connectionString: connectionOptions as DataBusType })
        );
    }

}