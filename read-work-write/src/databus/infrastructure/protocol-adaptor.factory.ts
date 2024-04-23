import { parseConnectionString } from "src/common/helpers/connection-string";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import * as util from 'node:util';
import { DataBusErrors } from "../errors";
import { ProtocolAdaptor, ProtocolAdaptorConstructor, ProtocolAdaptorFactory } from "../domain/protocol";
import { StdProtocolAdaptor } from "./protocols/std";
import { FileProtocolAdaptor } from "./protocols/file";


@Injectable()
export class ProtocolAdaptorFactoryImplement implements ProtocolAdaptorFactory {
    private readonly classMap: {[key: string]: Partial<ProtocolAdaptor> & ProtocolAdaptorConstructor} = {
        'std': StdProtocolAdaptor,
        'file': FileProtocolAdaptor,
    }

    create(connectionString: string): ProtocolAdaptor {
        let {protocol, connectionOptions} = parseConnectionString(connectionString);
        if (!this.classMap[protocol]) {
            throw new BadRequestException(util.format(DataBusErrors.UNKNOWN_PROTOCOL, protocol))
        }

        return new (this.classMap[protocol])(connectionOptions);
    }
}