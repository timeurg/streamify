import { Readable, Writable } from "node:stream";
import { Observable, Subject } from "rxjs";
import { DataBusTypeMap } from "src/databus/domain/databus";
import { ProtocolAdaptor } from "src/databus/domain/protocol";
import { ConnectionOptions, Empty, ErrorCode, JSONCodec, NatsConnection, StringCodec, connect, headers } from "nats";
import { promises as fs } from "node:fs";
import * as util from 'node:util';
import { DataBusErrors } from "../../errors";
import * as crypto from 'node:crypto';
import { NatsReadableStream } from "./nats/input.stream";
import { NatsWritableStream } from "./nats/output.stream";

//@TODO https://github.com/nats-io/nats.deno/blob/main/jetstream.md
export class NatsProtocolAdaptor implements ProtocolAdaptor {

    private stream: Readable | Writable;
    private state$: Subject<'BUSY'|'READY'> = new Subject();
    private connection: NatsConnection;
    private config: {
        connection: ConnectionOptions,
        subject: string,
    };

    constructor(private connectionString: string) {}
    
    async connect(mode: keyof DataBusTypeMap): Promise<void> {
        const config = await fs.readFile(this.connectionString, {encoding: 'utf-8'});
        this.config = JSON.parse(config);
        //@TODO check config
        this.connection = await connect(this.config.connection);
        this.state$.next('READY');
        return;
    }
    
    async disconnect(): Promise<void> {
        if (this.connection.isClosed() || this.connection.isDraining()) {
            return;
        }
        this.state$.complete();
        await this.connection.drain();
        await this.connection.close();
        const err = await this.connection.closed()
        if (err) {
          console.log('NATS disconnect', err)
        }
        this.stream && this.stream.destroy();
        return;
    }

    
    getStream(mode: keyof DataBusTypeMap): Readable | Writable {
        if (this.stream) {
            return this.stream;
        }
        if (!this.connection) {
            throw new Error(util.format(DataBusErrors.PROTOCOL_PREMATURE_GETSTREAM, this.constructor.name))
        }
        if (mode == 'input') {
            this.stream = new NatsReadableStream({}, this.connection, this.config.subject);
            this.stream.on('close', () => this.disconnect())
        } else {
            this.stream = new NatsWritableStream({}, this.connection, this.config.subject);
            this.stream.on('finish', () => this.disconnect());
        }
        return this.stream;
    }    

    state(): Observable<'BUSY'|'READY'> {
        return this.state$.asObservable();
    }
}