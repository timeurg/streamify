import { LoggerService } from '@nestjs/common';
import { Transform, TransformCallback, TransformOptions } from 'node:stream';
import { runTimeConfiguration } from 'src/config';

export class Slow extends Transform {
  constructor(
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
        runTimeConfiguration.SlowValue + Math.floor(Math.random() * 500);
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          this.logger.log(`Slowed response by ${slow} ms`);
          await callback(null, chunk);
          resolve();
        }, runTimeConfiguration.SlowValue);
      });
    };
    processData(chunk);
  }
}
