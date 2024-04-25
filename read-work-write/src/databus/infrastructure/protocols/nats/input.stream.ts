import { Empty, ErrorCode, MsgHdrs, NatsConnection, headers } from "nats";
import * as crypto from 'node:crypto';
import { Readable, ReadableOptions } from 'node:stream';

// https://nodejs.org/api/stream.html#api-for-stream-implementers
export class NatsReadableStream extends Readable {
  private timeout: number = 1000;
  private headers: MsgHdrs = headers();
  constructor(options: ReadableOptions, private connection: NatsConnection, private subject: string) {
    
    super(options);
    this.headers.append("transactionId", crypto.randomUUID())
    
  }

  // https://nodejs.org/api/stream.html#readable_readsize
  async _read(n) {
    let ready = true, offset = 0;
    while (ready && !this.connection.isClosed() && !this.connection.isDraining()) {
        try {
            let data;
            await this.connection.request(
                this.subject, 
                Empty, 
                { noMux: true, timeout: this.timeout, headers: this.headers }
            ).then((m) => {
                data = m.data;
            });
            if (data.length == 0) {
                data = null;
            }
            ready = this.push(data);
        } catch (error) {
            switch (error.code) {
              case ErrorCode.NoResponders:
                await new Promise(r => setTimeout(r, this.timeout));
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
} 