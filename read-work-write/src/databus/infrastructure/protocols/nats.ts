import { Readable, Writable } from "node:stream";
import { Observable, Subject } from "rxjs";
import { DataBusTypeMap } from "src/databus/domain/databus";
import { ProtocolAdaptor } from "src/databus/domain/protocol";
import { ConnectionOptions, Empty, ErrorCode, JSONCodec, NatsConnection, StringCodec, connect, headers } from "nats";
import { promises as fs } from "node:fs";
import * as util from 'node:util';
import { DataBusErrors } from "../../errors";
import * as crypto from 'node:crypto';

export class NatsProtocolAdaptor implements ProtocolAdaptor {

    private stream: Readable | Writable;
    private state$: Subject<'BUSY'|'READY'> = new Subject();
    private connection: NatsConnection;
    private config: {
        connection: ConnectionOptions,
        subject: string,
    };

    constructor(private connectionString: string) {

    }
    
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

    //maybe https://github.com/nats-io/nats.deno/blob/main/jetstream.md
    getStream(mode: keyof DataBusTypeMap): Readable | Writable {
        // https://nodejs.org/api/stream.html#api-for-stream-implementers
        if (!this.connection) {
            throw new Error(util.format(DataBusErrors.PROTOCOL_PREMATURE_GETSTREAM, this.constructor.name))
        }
        const codec = JSONCodec();
        if (mode = 'input') {
            // https://nodejs.org/api/stream.html#readable_readsize
            const timeout = 1000, header = headers();
            header.append("transactionId", crypto.randomUUID())
            const read_ = async (push) => {
                let ready = true, offset = 0;
                while (ready && !this.connection.isClosed() && !this.connection.isDraining()) {
                    try {
                        let data;
                        await this.connection.request(
                            this.config.subject, 
                            codec.encode(offset), 
                            { noMux: true, timeout, headers: header }
                        ).then((m) => {
                            data = m.data;
                        });
                        if (data.length == 0) {
                            data = null;
                        }
                        ready = push(data);
                    } catch (error) {
                        switch (error.code) {
                          case ErrorCode.NoResponders:
                            await new Promise(r => setTimeout(r, timeout));
                            break;
                          case ErrorCode.Timeout:
                            break;
                        case ErrorCode.ConnectionDraining:
                            ready = false;
                            break;
                          default:
                            console.log('Unknown NATS error', error)
                            throw error;
                        }
                    }
                }
            }
            this.stream = new Readable({
                read(size) {
                    read_(this.push.bind(this));
                },
                // signal: controller.signal,  /*@TODO*/
            });
        } else {
            throw new Error('Method not implemented.')
            this.stream = new Writable({
                write(chunk, encoding, callback) {
                  // ...
                },
                writev(chunks, callback) {
                  // ...
                },
                // signal: controller.signal,  /*@TODO*/
            });
        }
        return this.stream;
    }    

    state(): Observable<'BUSY'|'READY'> {
        return this.state$.asObservable();
    }
}