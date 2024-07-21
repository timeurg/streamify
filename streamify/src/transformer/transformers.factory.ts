import { Inject, Logger } from '@nestjs/common';
import * as zlib from 'node:zlib';
import { Transform } from 'stream';
import { TransformerErrors, TransformerFactory } from './transformers';
import * as util from 'node:util';
import { Slow } from './impl/slow.transformer';
import { Aggregate } from './impl/aggregate';
import { Arr2ObjHeader } from './impl/array2obj-header';
import { ToJSON } from './impl/toJSON';
import { Extract } from './impl/extract';

export class TransformerFactoryImpl implements TransformerFactory {
  @Inject() private logger: Logger;
  
  create(description: string): Transform {
    const [code, argstr] = description.split(':');
    switch (code) {
      case 'gzip':
        this.logger.verbose('Creating gzip job');
        return zlib.createGzip();
      case 'aggregate':
        return new Aggregate(argstr == '' ? undefined : +argstr, {}, this.logger);
      case 'extract':
        return new Extract(argstr, {}, this.logger);
      case 'row2obj':
        return new Arr2ObjHeader({}, this.logger);
      case 'toJSON':
        return new ToJSON({}, this.logger);
      case 'slow':
        let [from, to] = (argstr || '').split('-').map(i => parseInt(i) || 0);
        this.logger.verbose(`Slowing by ${from}-${to} ms`);
        if (from === undefined) {
          from = to = 0;
        }
        if (to == undefined) {
          to = from;
          from = 0;
        }
        return new Slow(from, to, {}, this.logger);
      default:
        throw new Error(
          util.format(
            TransformerErrors.UNKNOWN_CALL_STRING,
            description,
          ),
        );
        break;
    }
  }
}
