import { LoggerService } from '@nestjs/common';
import { NatsConnection, StringCodec, Subscription } from 'nats';
import { Writable, WritableOptions } from 'node:stream';
import { BehaviorSubject } from 'rxjs';
import { runTimeConfiguration } from 'src/config';

const sc = StringCodec();

// https://nodejs.org/api/stream.html#implementing-a-writable-stream
export class NatsWritableStream extends Writable {
  private subscription: Subscription;
  private transactionId: string;
  private batchCount = 0;
  private currentChunk = new BehaviorSubject<string | Uint8Array>(undefined);
  private currentCallback = new BehaviorSubject<(error?: Error) => void>(
    undefined,
  );
  private looping = false;

  constructor(
    options: WritableOptions,
    private connection: NatsConnection,
    private subject: string,
    private logger: LoggerService,
  ) {
    super(
      Object.assign(options, {
        highWaterMark: runTimeConfiguration.NatsOutputHighWaterMark,
      }),
    );
    this.logger.debug(
      `Higwatermark at ${runTimeConfiguration.NatsOutputHighWaterMark}`,
    );
    this.subscription = this.connection.subscribe(this.subject);
  }

  async subLoop() {
    if (this.looping) {
      return;
    }
    this.looping = true;
    (async (sub) => {
      for await (const m of sub) {
        if (m.headers) {
          const transactionId = m.headers.get('transactionId');
          const batchCount = Number.parseInt(m.headers.get('batchCount'));
          // new transaction
          if (!this.transactionId && batchCount == 0) {
            this.transactionId = transactionId;
            this.logger.log(`Transaction ${this.transactionId} started`);
          }
          // we respond only to current batchCount queries
          // batchCount increase in request means
          // previous batch was succesfully processed, so we call saved write callback
          if (transactionId && this.transactionId == transactionId) {
            if (batchCount == this.batchCount) {
              //synced request, provide pending data
              const chunk = this.currentChunk.getValue();
              if (chunk !== undefined) {
                m.respond(
                  chunk instanceof Uint8Array ? chunk : sc.encode(chunk),
                );
                this.logger.verbose(`Batch ${this.batchCount} sent`);
                //end of transfer
                if (chunk.length == 0) {
                  this.logger.verbose('End of transfer');
                  this.subscription
                    .drain()
                    .then(() => this.subscription.unsubscribe())
                    .then(() => this.callback());
                }
              }
            } else if (batchCount == this.batchCount + 1) {
              //next request, call write callback and clear pending data to enable subsequent writes
              this.batchCount++;
              this.callback();
            } else {
              this.logger.log(
                `Client asks for batch ${batchCount}, we're at ${this.batchCount}`,
              );
            }
          }
        }
      }
    })(this.subscription).catch((e) => {
      this.logger.error(e);
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
  private last = 0;
  _write(chunk, encoding, callback) {
    if (chunk.length > this.last) {
      this.logger.verbose(
        `Queued ${chunk.length / 1024} Kb ${this.transactionId ? `for ${this.transactionId} batch number ${this.batchCount}` : ''}`,
      );
      this.last = chunk.length;
    }
    this.subLoop();
    this.currentCallback.next(callback);
    this.currentChunk.next(chunk);
  }

  _writev(chunks, callback) {
    this.logger.verbose(
      `Queued ${(chunks.length * 65536) / 1024 / 1024} Mb, batch: ${this.batchCount}`,
    );
    this.subLoop();
    this.currentCallback.next(callback);
    this.currentChunk.next(Buffer.concat(chunks.map((c) => c.chunk)));
  }

  _final(callback: (error?: Error) => void): void {
    this.logger.log(`Transaction ${this.transactionId} ended`);
    this.callback();
    this.currentChunk.next('');
    this.currentCallback.next(callback);
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
