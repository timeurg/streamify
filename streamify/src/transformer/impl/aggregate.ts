import { Transform, TransformCallback, TransformOptions } from "stream";
import { LoggerService } from '@nestjs/common';

export class Aggregate extends Transform {
  constructor(
    private threshhold: number,
    opts: TransformOptions,
    private logger: LoggerService,
  ) {
    super({ ...opts, objectMode: true, readableObjectMode: true, writableObjectMode: true });
  }
    
    private chunks: any[] = [];
    private report_thr = 5;

  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
        this.chunks.push(chunk);
        if (this.chunks.length > this.report_thr) {
            this.logger.verbose(`Aggregated ${this.chunks.length} entries`);
            this.report_thr += this.report_thr;
        }
        if (this.chunks.length == this.threshhold) {
            this.push(this.chunks);
            this.chunks = [];
        }
        callback();
  }
    
    _flush(callback) {
        this.push(this.chunks);
        callback();
    }
}