import { Empty, ErrorCode, MsgHdrs, NatsConnection, StringCodec, Subscription, headers } from "nats";
import { WritableOptions, Writable } from 'node:stream';

const sc = StringCodec();

// https://nodejs.org/api/stream.html#implementing-a-writable-stream
export class NatsWritableStream extends Writable {
  private timeout: number = 1000;
  private headers: MsgHdrs = headers();
  private subscription: Subscription;
  private transactionId: string;

  constructor(options: WritableOptions, private connection: NatsConnection, private subject: string) {
    super(options);
    this.subscription = this.connection.subscribe(this.subject);
  }

  /**
   * 
   * @param chunk 
   * @param encoding 
   * @param callback 
   * All calls to writable.write() that occur between the time writable._write() is called and the callback is called 
   * will cause the written data to be buffered. When the callback is invoked, the stream might emit a 'drain' event. 
   * If a stream implementation is capable of processing multiple chunks of data at once, 
   * the writable._writev() method should be implemented.
   */
  _write(chunk, encoding, callback) {
    (async (sub) => {
      for await (const m of sub) {
        let transactionId;
        if (m.headers) {
          transactionId = m.headers.get("transactionId");
          if (!this.transactionId) {
            this.transactionId = transactionId;
          }
        }
        if (transactionId && this.transactionId == transactionId) {
          // if (!()) {}
          m.respond(chunk instanceof Uint8Array ? chunk : sc.encode(chunk)) && callback();
        }
      }
    })(this.subscription).catch(e => callback(e));
  }

  // _writev(chunks, callback) {
  //   // ...
  // }

} 