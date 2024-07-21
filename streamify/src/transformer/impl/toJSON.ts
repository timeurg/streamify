import { Transform, TransformCallback, TransformOptions } from "stream";
import { LoggerService } from '@nestjs/common';

const _ = Symbol.for('headers-parsed')
export class ToJSON extends Transform {
    constructor(
        opts: TransformOptions,
        private logger: LoggerService,
    ) {
    super({ ...opts, objectMode: true, readableObjectMode: true, writableObjectMode: true });
    }
    _transform(chunk, encoding, callback,) {
        if (Array.isArray(chunk)) {
            callback(null, "[\n" + chunk.map(i => JSON.stringify(i)).join(",\n") + "\n]")
        } else {
            callback(null, JSON.stringify(chunk))
        }
    }
}