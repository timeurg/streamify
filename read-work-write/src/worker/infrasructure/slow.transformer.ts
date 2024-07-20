import { LoggerService } from '@nestjs/common';
import { Transform, TransformCallback, TransformOptions } from 'node:stream';
import { runTimeConfiguration } from 'src/config';

export class Slow extends Transform {
  constructor(
    private from: number, 
    private to: number,
    opts: TransformOptions,
    private logger: LoggerService,
  ) {
    super(opts);
  }
  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    const processData = (data) => {
      const slow =
        this.to + Math.floor(Math.random() * (this.from - this.to)) - this.from;
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          this.logger.log(`Slowed response by ${slow} ms`);
          await callback(null, data);
          resolve();
        }, slow);
      });
    };
    processData(chunk);
  }
}
