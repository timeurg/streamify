import { Transform, TransformCallback, TransformOptions } from "stream";
import { LoggerService } from '@nestjs/common';

const _ = Symbol.for('headers-parsed')
export class Arr2ObjHeader extends Transform {
    private headers = {
        [_]: false,
    };
    constructor(
        opts: TransformOptions,
        private logger: LoggerService,
    ) {
    super({ ...opts, objectMode: true, readableObjectMode: true, writableObjectMode: true });
    }
    _transform(record, encoding, callback,) {
        if (!this.headers[_]) {
            for (const i in record) {
                this.headers[i] = record[i]
            }
            this.headers[_] = true;
            callback();
        } else {
            const dto = {};
            for (const i in this.headers) {
                dto[this.headers[i]] = record[i]
            }
            callback(null, dto);
        }
    }
}