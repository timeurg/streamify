import { Inject, Logger } from '@nestjs/common';
import * as zlib from 'node:zlib';
import { Transform } from 'stream';
import { TransformerFactory } from '../domain/transformers';
import { Slow } from './slow.transformer';

export class TransformerFactoryImpl implements TransformerFactory {
  @Inject() private logger: Logger;
  create(code: string): Transform {
    switch (code) {
      case 'gzip':
        this.logger.verbose('Creating gzip job');
        return zlib.createGzip();
      case 'slow':
        this.logger.verbose('Creating slow job');
        return new Slow({}, this.logger);
      default:
        break;
    }
  }
}
