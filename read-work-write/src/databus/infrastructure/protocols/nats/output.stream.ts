import { Empty, ErrorCode, MsgHdrs, NatsConnection, StringCodec, Subscription, headers } from "nats";
import { WritableOptions, Writable } from 'node:stream';
import { BehaviorSubject, Subject, lastValueFrom } from "rxjs";

const sc = StringCodec();

// https://nodejs.org/api/stream.html#implementing-a-writable-stream
export class NatsWritableStream extends Writable {
  private timeout: number = 1000;
  private headers: MsgHdrs = headers();
  private subscription: Subscription;
  private transactionId: string;
  private batchCount = 0;
  private currentChunk = new BehaviorSubject<string | Uint8Array>(undefined);
  private currentCallback = new BehaviorSubject<Function>(undefined);
  private looping = false;

  

  constructor(options: WritableOptions, private connection: NatsConnection, private subject: string) {
    super(options);
    this.subscription = this.connection.subscribe(this.subject);
  }

  async subLoop() {
    if (this.looping){
      return;
    }
    this.looping = true;
    (async (sub) => {
      for await (const m of sub) {
        if (m.headers) {
          const transactionId = m.headers.get("transactionId");
          // new transaction
          if (!this.transactionId) {
            this.transactionId = transactionId;
          }
          const batchCount = Number.parseInt(m.headers.get("batchCount"));
          // we respond only to current batchCount queries
          // batchCount increase in request means 
          // previous batch was succesfully processed, so we call saved write callback
          if (transactionId && this.transactionId == transactionId) {
            if (batchCount == this.batchCount) { 
              //synced request, provide pending data        
              const chunk = this.currentChunk.getValue();
              if (chunk) {
                m.respond(chunk instanceof Uint8Array ? chunk : sc.encode(chunk));
                if (chunk.length == 0) {
                  this.callback(); //end of transfer
                }
              }
            } else if (batchCount == this.batchCount + 1) { 
              //next request, call write callback and clear pending data to enable subsequent writes
              this.batchCount++;
              this.callback();
            }
          }
        }
      }
    })(this.subscription).catch(e => {
      console.log(e);
      this.callback(e);
    });
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
    this.subLoop();
    this.currentCallback.next(callback);
    this.currentChunk.next(chunk);
  }

  // _writev(chunks, callback) {
  //   // ...
  // }
  _final(callback: (error?: Error) => void): void {
    this.callback();
    this.currentCallback.complete();
    this.currentChunk.complete();
    this.subscription.drain()
      .then(() => this.subscription.unsubscribe())
      .then(() => callback());
  }

  callback(e?) {
    const callback = this.currentCallback.getValue();
    if (typeof callback === 'function') {
      this.currentCallback.next(undefined);
      this.currentChunk.next(undefined);
      callback(e);
    }
  }

} 