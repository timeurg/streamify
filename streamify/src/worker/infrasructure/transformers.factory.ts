import { Inject, Logger } from '@nestjs/common';
import * as zlib from 'node:zlib';
import { Transform } from 'stream';
import { TransformerFactory } from '../domain/transformers';
import { Slow } from './slow.transformer';

export class TransformerFactoryImpl implements TransformerFactory {
  @Inject() private logger: Logger;
  
  create(description: string): Transform {
    const [code, argstr] = description.split(':');
    switch (code) {
      case 'gzip':
        this.logger.verbose('Creating gzip job');
        return zlib.createGzip();
      case 'slow':
        this.logger.verbose('Creating slow job');
        let [from, to] = (argstr || '').split('-').map(i => parseInt(i) || 0);
        if (from === undefined) {
          from = to = 0;
        }
        if (to == undefined) {
          to = from;
          from = 0;
        }
        return new Slow(from, to, {}, this.logger);
      default:
        break;
    }
  }
}
