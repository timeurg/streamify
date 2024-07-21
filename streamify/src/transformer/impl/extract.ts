import { Transform, TransformCallback, TransformOptions } from "stream";
import { LoggerService } from '@nestjs/common';

const _ = Symbol.for('headers-parsed')
export class Extract extends Transform {
    constructor(
        private propName: string,
        opts: TransformOptions,
        private logger: LoggerService,
    ) {
    super({ ...opts, objectMode: true, readableObjectMode: true, writableObjectMode: true });
    }
    _transform(data, encoding, callback,) {
        callback(null, data[this.propName]);
    }
}