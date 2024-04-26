import { LoggerService } from "@nestjs/common";
import { Empty, ErrorCode, MsgHdrs, NatsConnection, headers } from "nats";
import * as crypto from 'node:crypto';
import { Readable, ReadableOptions } from 'node:stream';

// https://nodejs.org/api/stream.html#api-for-stream-implementers
export class NatsReadableStream extends Readable {
  private timeout: number = 1000;
  private batchCount = 0;
  private transactionId: string;

  constructor(options: ReadableOptions, private connection: NatsConnection, private subject: string, private logger: LoggerService) {    
    super(options);
    this.transactionId = crypto.randomUUID();
  }

  headers () {
    const header = headers();
    header.append("transactionId", this.transactionId);
    header.append("batchCount", this.batchCount.toString());
    return header;
  }

  private inFlight = false;

  // https://nodejs.org/api/stream.html#readable_readsize
  async _read(n) {
    if (this.inFlight) {
      return;
    } else {
      this.inFlight = true;
    }
    let ready = true;
    if (this.batchCount !== 0) {
      this.batchCount++;
    }
    while (ready && !this.connection.isClosed() && !this.connection.isDraining()) {
        try {
            let data: string | Uint8Array;
            await this.connection.request(
                this.subject, 
                Empty, 
                { noMux: true, timeout: this.timeout, headers: this.headers() }
            ).then((m) => {
                data = m.data;
            });
            if (data.length == 0) {
              this.logger.log('End of transfer')
                data = null;
            }
            ready = this.push(data);
            this.batchCount++;
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
                this.logger.error('Unknown NATS error', error)
                throw error;
            }
        }
    }
    
    this.inFlight = false;
  }
} 